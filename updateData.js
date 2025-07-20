
const fs = require('fs');
const path = require('path');

// Simulated scraper with mock data (replace with real HTTP scrape if needed)
const games = ['6-42', '6-45', '6-49', '6-55', '6-58', '2D', '3D', '4D'];
const today = new Date().toISOString().split('T')[0];

function generateMockNumbers(game) {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const z = n => n.toString().padStart(2, '0');

  if (game.startsWith('6-')) {
    const max = parseInt(game.split('-')[1], 10);
    const nums = new Set();
    while (nums.size < 6) nums.add(z(rand(1, max)));
    return Array.from(nums).sort();
  } else if (game === '4D') {
    return Array.from({ length: 4 }, () => rand(0, 9).toString());
  } else if (game === '3D') {
    return Array.from({ length: 3 }, () => rand(0, 9).toString());
  } else if (game === '2D') {
    return [z(rand(1, 31)), z(rand(1, 31))];
  }
  return [];
}

games.forEach(game => {
  const newDraw = {
    date: today,
    numbers: generateMockNumbers(game)
  };

  const filePath = path.join(__dirname, 'data', `${game}.json`);

  if (fs.existsSync(filePath)) {
    const existing = JSON.parse(fs.readFileSync(filePath));
    const updated = [newDraw, ...existing.filter(e => e.date !== today)];
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    console.log(`✅ Updated ${game}`);
  } else {
    fs.writeFileSync(filePath, JSON.stringify([newDraw], null, 2));
    console.log(`📄 Created new file for ${game}`);
  }
});
