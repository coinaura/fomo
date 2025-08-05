
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { zoomToken } from '../lib/zoomToken.js';

export default async (_: VercelRequest, res: VercelResponse) => {
  const ids = (process.env.WEBINAR_IDS || '').split(',').filter(Boolean);
  if (!ids.length) return res.status(400).json({ error: 'WEBINAR_IDS missing' });

  const token = await zoomToken();

  const webinars = await Promise.all(
    ids.map(async (id) => {
      const r = await fetch(`https://api.zoom.us/v2/webinars/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(`Zoom API ${r.status} for webinar ${id}`);
      const w = await r.json();
      return { id: w.id, topic: w.topic, occurrences: w.occurrences };
    })
  );

  res.status(200).json(webinars);
};
