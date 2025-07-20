import { readFileSync } from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { game, date } = req.query;
  if (!game || !date) return res.status(400).json({ error: "Missing game or date" });

  try {
    const file = path.join(process.cwd(), 'data', `${game}.json`);
    const data = JSON.parse(readFileSync(file, 'utf8'));

    const result = data.find(draw => draw.date === date);
    if (!result) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ game, date: result.date, numbers: result.numbers });
  } catch {
    res.status(500).json({ error: "Game not supported or error reading file" });
  }
}
