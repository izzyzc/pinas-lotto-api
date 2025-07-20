
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

const today = new Date().toISOString().split('T')[0];

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
      const numbers = [];

      $(section).find('.draw-result .draw-ball').each((_, el) => {
        numbers.push($(el).text().trim());
      });

      if (numbers.length === 0) return;

      const newDraw = {
        date: today,
        numbers: numbers
      };

      const filePath = path.join(__dirname, 'data', `${game}.json`);
      let existing = [];
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath));
      }

      const updated = [newDraw, ...existing.filter(e => e.date !== today)];
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
      console.log(`✅ Scraped and updated ${game}`);
    });

  } catch (err) {
    console.error("❌ Error scraping lotto results:", err.message);
  }
}

fetchAndUpdateResults();
