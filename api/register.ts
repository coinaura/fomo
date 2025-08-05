import type { VercelRequest, VercelResponse } from '@vercel/node';
import { zoomToken } from '../lib/zoomToken.js';

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { webinarId, occurrenceId, name, school, email, phone } = req.body || {};
  const [first_name, ...rest] = (name || '').trim().split(' ');
  const last_name = school || rest.join(' ') || '—';

  const token = await zoomToken();

  const z = await fetch(
    `https://api.zoom.us/v2/webinars/${webinarId}/registrants?occurrence_ids=${occurrenceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ first_name, last_name, email, phone }),
    }
  );

  if (!z.ok) return res.status(500).json({ error: await z.text() });

  const { join_url } = await z.json();
  res.status(200).json({ join_url });
};
