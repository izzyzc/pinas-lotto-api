import { readFileSync } from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { game, limit = 100 } = req.query;
  if (!game) return res.status(400).json({ error: "Missing game" });

  try {
    const file = path.join(process.cwd(), 'data', `${game}.json`);
    const data = JSON.parse(readFileSync(file, 'utf8')).slice(0, limit);

    const freq = {};
    data.forEach(draw => {
      draw.numbers.forEach(num => {
        freq[num] = (freq[num] || 0) + 1;
      });
    });

    res.status(200).json({ game, limit: Number(limit), frequency: freq });
  } catch {
    res.status(500).json({ error: "Error reading frequency" });
  }
}
