const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const gamesMap = {
  '6/42': '6-42',
  '6/45': '6-45',
  '6/49': '6-49',
  '6/55': '6-55',
  '6/58': '6-58',
  '2D': '2D',
  '3D': '3D',
  '4D': '4D'
};

function parseDate(text) {
  // Converts "July 17, 2025" to "2025-07-17"
  const d = new Date(text);
  if (!isNaN(d)) return d.toISOString().split('T')[0];
  return null;
}

async function fetchAndUpdateResults() {
  try {
    const { data: html } = await axios.get('https://www.lottopcso.com/');
    const $ = cheerio.load(html);

    const gameSections = $('section[id^="results"]');

    gameSections.each((_, section) => {
      const gameTitle = $(section).find('h2').text().trim();
      const gameKey = Object.keys(gamesMap).find(k => gameTitle.includes(k));
      if (!gameKey) return;

      const game = gamesMap[gameKey];

      // Extract draw date
      const drawDateText = $(section).find('.result-date').text().trim();
      const drawDate = parseDate(drawDateText);
      if (!drawDate) return;

      // Extract drawn numbers
      const numbers = [];
      $(section).find('.draw-result .draw-ball').each((_, el) => {
        numbers.push($(el).text().trim());
      });

      // Extract jackpot if available
      let jackpot = null;
      const jackpotText = $(section).find('.result-jackpot').text().trim();
      if (jackpotText) {
        jackpot = jackpotText.replace(/[\\n\\t,]/g, '').replace(/[^\\d]/g, '');
      }

      const newDraw = {
        date: drawDate,
        numbers,
        ...(jackpot && { jackpot })
      };

      const filePath = path.join(__dirname, 'data', `${game}.json`);
      let existing = [];
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath));
      }

      const updated = [newDraw, ...existing.filter(e => e.date !== drawDate)];
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
      console.log(`✅ ${game} updated for ${drawDate}`);
    });

  } catch (err) {
    console.error("❌ Error scraping lotto results:", err.message);
  }
}

fetchAndUpdateResults();
