import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const INDEKS = 'boydenskjema:index';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Bruk POST' });
  }

  try {
    const data = req.body;

    if (!data || typeof data !== 'object' || !data.navn || !String(data.navn).trim()) {
      return res.status(400).json({ error: 'Navn mangler' });
    }
    if (JSON.stringify(data).length > 200000) {
      return res.status(413).json({ error: 'Besvarelsen er for stor' });
    }

    data.innsendt = new Date().toISOString();

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    await redis.set(`boydenskjema:${id}`, data);
    await redis.sadd(INDEKS, id);

    return res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error('Innsending feilet:', err);
    return res.status(500).json({ error: 'Kunne ikke lagre besvarelsen' });
  }
}
