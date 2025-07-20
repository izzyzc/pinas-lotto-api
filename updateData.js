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

// Converts "July 17, 2025" to "2025-07-17"
function parseDate(text) {
  const d = new Date(text);
  if (!isNaN(d)) return d.toISOString().split('T')[0];
  return null;
}

async function fetchAndUpdateResults() {
  try {
    const { data: html } = await axios.get('https://www.lottopcso.com/');
    const $ = cheerio.load(html);

    // Loop through all draw result containers
    const gameSections = $('section[id^="results"]');

    gameSections.each((_, section) => {
      const sectionElement = $(section);

      // Match the game from heading (like "Ultra Lotto 6/58")
      const gameTitle = sectionElement.find('h2').text().trim();
      const gameKey = Object.keys(gamesMap).find(k => gameTitle.includes(k));
      if (!gameKey) return;

      const game = gamesMap[gameKey];
      const resultBlocks = sectionElement.find('.result-container');

      resultBlocks.each((_, block) => {
        const blockElement = $(block);
        const drawDateText = blockElement.find('.result-date').text().trim();
        const drawDate = parseDate(drawDateText);
        if (!drawDate) return;

        const numbers = [];
        blockElement.find('.draw-ball').each((_, el) => {
          numbers.push($(el).text().trim());
        });

        let jackpot = null;
        const jackpotText = blockElement.find('.result-jackpot').text().trim();
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

        const alreadyExists = existing.some(e => e.date === drawDate);
        if (!alreadyExists) {
          existing.unshift(newDraw);
          fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
          console.log(`✅ ${game} updated for ${drawDate}`);
        }
      });
    });

  } catch (err) {
    console.error("❌ Error scraping lotto results:", err.message);
  }
}

fetchAndUpdateResults();
