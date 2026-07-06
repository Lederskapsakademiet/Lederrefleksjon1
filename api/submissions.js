import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const INDEKS = 'boydenskjema:index';

function autorisert(req, res) {
  const riktig = process.env.ADMIN_PASSWORD;
  if (!riktig) {
    res.status(500).json({
      error: 'ADMIN_PASSWORD er ikke satt. Legg den til under Settings → Environment Variables i Vercel.',
    });
    return false;
  }
  const gitt = req.headers['x-admin-password'];
  if (!gitt || gitt !== riktig) {
    res.status(401).json({ error: 'Feil passord' });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (!autorisert(req, res)) return;

  try {
    if (req.method === 'GET') {
      const ider = await redis.smembers(INDEKS);
      if (!ider.length) return res.status(200).json({ svar: [] });

      const nokler = ider.map((id) => `boydenskjema:${id}`);
      const verdier = await redis.mget(...nokler);

      const svar = [];
      verdier.forEach((v, i) => {
        if (v) svar.push({ id: ider[i], data: v });
      });
      svar.sort((a, b) => (b.data.innsendt || '').localeCompare(a.data.innsendt || ''));

      return res.status(200).json({ svar });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Mangler id' });

      await redis.del(`boydenskjema:${id}`);
      await redis.srem(INDEKS, id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Metode ikke tillatt' });
  } catch (err) {
    console.error('Admin-operasjon feilet:', err);
    return res.status(500).json({ error: 'Serverfeil i databasen' });
  }
}
