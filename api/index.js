const crypto = require('crypto');
const RESOURCES = ['students', 'teachers', 'classes', 'grades', 'attendance'];
const sign = () => crypto.createHmac('sha256', process.env.AUTH_SECRET || 'dev-secret').update('admin').digest('hex');
const mem = global.__mem || (global.__mem = {});
const U = process.env.UPSTASH_REDIS_REST_URL, T = process.env.UPSTASH_REDIS_REST_TOKEN;

async function load(name) {
  if (!U) return mem[name] || [];
  const r = await fetch(`${U}/get/school:${name}`, { headers: { Authorization: `Bearer ${T}` } });
  const j = await r.json();
  return j.result ? JSON.parse(j.result) : [];
}
async function save(name, rows) {
  if (!U) { mem[name] = rows; return; }
  await fetch(`${U}/set/school:${name}`, { method: 'POST', headers: { Authorization: `Bearer ${T}` }, body: JSON.stringify(rows) });
}

module.exports = async (req, res) => {
  const name = req.query.p || '';
  if (!name) return res.json({ ok: true, message: 'School API is running' });

  if (name === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const { password } = req.body || {};
    if (password && password === (process.env.ADMIN_PASSWORD || 'admin123')) return res.json({ token: sign() });
    return res.status(401).json({ error: 'Wrong password' });
  }

  if ((req.headers.authorization || '') !== `Bearer ${sign()}`) return res.status(401).json({ error: 'Not signed in' });
  if (!RESOURCES.includes(name)) return res.status(404).json({ error: 'Unknown resource' });
  try {
    const rows = await load(name);
    if (req.method === 'GET') return res.json(rows);
    if (req.method === 'POST') {
      const row = { ...req.body, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
      rows.push(row); await save(name, rows); return res.status(201).json(row);
    }
    if (req.method === 'DELETE') { await save(name, rows.filter(r => r.id !== req.query.id)); return res.json({ ok: true }); }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
