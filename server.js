const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const MEMBERS_FILE = path.join(__dirname, 'data', 'members.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Simple HTTP Basic Auth / token middleware for /api routes
// Credentials must be provided via environment variables in production.
const AUTH_USER = process.env.ADMIN_USER || process.env.API_USER || null;
const AUTH_PASS = process.env.ADMIN_PASS || process.env.API_PASS || null;
// A simple API token can be provided directly or derived from USER:PASS (if both set)
const API_TOKEN = process.env.API_TOKEN || (AUTH_USER && AUTH_PASS ? Buffer.from(`${AUTH_USER}:${AUTH_PASS}`).toString('base64') : null);
function basicAuth(req, res, next){
  const auth = req.headers.authorization || '';
  const apiKey = req.headers['x-api-key'] || '';
  // If no credentials configured on the server, refuse requests explicitly
  if(!API_TOKEN && !(AUTH_USER && AUTH_PASS)){
    return res.status(503).json({ error: 'Server auth not configured. Set ADMIN_USER/ADMIN_PASS or API_TOKEN.' });
  }
  // Accept: Basic <base64(user:pass)> OR Bearer <token> OR x-api-key: <token>
  if(auth.startsWith('Basic ')){
    try{
      const creds = Buffer.from(auth.split(' ')[1], 'base64').toString();
      const [user, pass] = creds.split(':');
      if(user === AUTH_USER && pass === AUTH_PASS) return next();
      return res.status(403).json({ error: 'Forbidden' });
    }catch(e){ return res.status(400).json({ error: 'Bad auth header' }); }
  }
  if(auth.startsWith('Bearer ')){
    const token = auth.split(' ')[1];
    if(token === API_TOKEN) return next();
    return res.status(403).json({ error: 'Forbidden' });
  }
  if(apiKey && apiKey === API_TOKEN) return next();
  // no acceptable auth
  res.set('WWW-Authenticate', 'Basic realm="Resonnance API"');
  return res.status(401).json({ error: 'Authentication required' });
}

// Protect all API routes by default. Static files (data/members.json) remain public.
app.use('/api', basicAuth);

async function readMembers(){
  try{ const raw = await fs.readFile(MEMBERS_FILE, 'utf8'); return JSON.parse(raw); }
  catch(e){ console.error('readMembers error', e); return []; }
}

async function writeMembers(data){
  try{ await fs.writeFile(MEMBERS_FILE, JSON.stringify(data, null, 2), 'utf8'); return true; }
  catch(e){ console.error('writeMembers error', e); return false; }
}

app.get('/api/members', async (req, res) => {
  const members = await readMembers();
  res.json(members);
});

app.get('/api/members/:id', async (req, res) => {
  const id = req.params.id;
  const members = await readMembers();
  const m = members.find(x => String(x.id) === String(id));
  if(!m) return res.status(404).json({ error: 'Not found' });
  res.json(m);
});

app.post('/api/members', async (req, res) => {
  const item = req.body;
  if(!item) return res.status(400).json({ error: 'No body' });
  const members = await readMembers();
  item.id = item.id || (members.reduce((max, v) => Math.max(max, v.id || 0), 0) + 1);
  members.push(item);
  const ok = await writeMembers(members);
  res.json(ok ? item : { error: 'write fail' });
});

app.put('/api/members/:id', async (req, res) => {
  const id = req.params.id;
  const payload = req.body;
  const members = await readMembers();
  const idx = members.findIndex(x => String(x.id) === String(id));
  if(idx === -1) return res.status(404).json({ error: 'Not found' });
  members[idx] = Object.assign({}, members[idx], payload, { id: members[idx].id });
  const ok = await writeMembers(members);
  res.json(ok ? members[idx] : { error: 'write fail' });
});

app.delete('/api/members/:id', async (req, res) => {
  const id = req.params.id;
  let members = await readMembers();
  members = members.filter(x => String(x.id) !== String(id));
  const ok = await writeMembers(members);
  res.json(ok ? { success: true } : { error: 'write fail' });
});

// Save full list (overwrite)
app.post('/api/members/save', async (req, res) => {
  const list = req.body;
  if(!Array.isArray(list)) return res.status(400).json({ error: 'Array expected' });
  const ok = await writeMembers(list);
  res.json(ok ? { success: true } : { error: 'write fail' });
});

// Helper: fetch OpenGraph metadata from a public URL (best-effort). Warning: LinkedIn may block or require auth.
async function fetchOpenGraph(url){
  try{
    const resp = await fetch(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; resonnance-bot/1.0)' } });
    if(!resp.ok) throw new Error('Bad response ' + resp.status);
    const text = await resp.text();
    const $ = cheerio.load(text);
    const og = {};
    $('meta').each((i, el) => {
      const prop = $(el).attr('property') || $(el).attr('name');
      const content = $(el).attr('content');
      if(!prop || !content) return;
      if(prop.startsWith('og:')) og[prop.slice(3)] = content;
    });
    // Fallback: page title
    if(!og.title){ og.title = $('title').text() || null; }
    return og;
  }catch(e){ console.error('fetchOpenGraph error', e && e.message); return null; }
}

app.post('/api/enrich', async (req, res) => {
  const { linkedin } = req.body || {};
  if(!linkedin) return res.status(400).json({ error: 'linkedin required' });
  const og = await fetchOpenGraph(linkedin);
  if(!og) return res.status(500).json({ error: 'Could not fetch' });
  res.json({ og });
});

// Batch enrich and merge: for given ids (or all), fetch OG and merge into members.json (best-effort).
app.post('/api/enrich-batch', async (req, res) => {
  const { ids } = req.body || {};
  let members = await readMembers();
  let toProcess = members;
  if(Array.isArray(ids) && ids.length) toProcess = members.filter(m => ids.includes(m.id) || ids.includes(String(m.id)));
  const results = [];
  for(const m of toProcess){
    if(!m.linkedin) { results.push({ id: m.id, ok: false, reason: 'no linkedin' }); continue; }
    const og = await fetchOpenGraph(m.linkedin);
    if(!og) { results.push({ id: m.id, ok: false, reason: 'fetch fail' }); continue; }
    // Merge rules: if photo missing and og.image present, set photo
    if((!m.photo || m.photo.length === 0) && og.image) m.photo = og.image;
    // If role missing and og.title contains headline, attempt to set role/company heuristically
    if((!m.role || m.role.length===0) && og.title){
      // og.title often like "Name | Profession" or "Name - Headline" — we try to extract after separator
      const t = og.title.split('|').pop().split('-').pop().trim();
      if(t && t.toLowerCase() !== (m.name || '').toLowerCase()) m.role = t;
    }
    // Add og snapshot
    m._og = m._og || {};
    m._og.fetched_at = (new Date()).toISOString();
    m._og.title = og.title || null;
    m._og.description = og.description || null;
    m._og.image = og.image || null;
    results.push({ id: m.id, ok: true });
  }
  const writeOk = await writeMembers(members);
  res.json({ results, writeOk });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`API server listening on http://localhost:${PORT}`));
