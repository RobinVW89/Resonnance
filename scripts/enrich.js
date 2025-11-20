// scripts/enrich.js
// CLI tool: enrich data/members.json by fetching OpenGraph metadata from linkedin URLs

const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const MEMBERS_FILE = path.join(__dirname, '..', 'data', 'members.json');

async function fetchOpenGraph(url){
  try{
    const resp = await fetch(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; resonnance-enrich/1.0)' } });
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
    if(!og.title) og.title = $('title').text() || null;
    return og;
  }catch(e){ console.error('fetchOpenGraph error', e && e.message); return null; }
}

async function main(){
  const raw = await fs.readFile(MEMBERS_FILE, 'utf8');
  const members = JSON.parse(raw);
  console.log(`Loaded ${members.length} members`);
  for(const m of members){
    if(!m.linkedin) continue;
    console.log(`Fetching ${m.id} ${m.name} -> ${m.linkedin}`);
    const og = await fetchOpenGraph(m.linkedin);
    if(!og){ console.log('  fetch failed'); continue; }
    if((!m.photo || m.photo.length===0) && og.image){ m.photo = og.image; console.log('  set photo from og:image'); }
    if((!m.role || m.role.length===0) && og.title){
      const t = og.title.split('|').pop().split('-').pop().trim();
      if(t && t.toLowerCase() !== (m.name || '').toLowerCase()){ m.role = t; console.log('  set role from og:title'); }
    }
    m._og = m._og || {};
    m._og.fetched_at = (new Date()).toISOString();
    m._og.title = og.title || null;
    m._og.description = og.description || null;
    m._og.image = og.image || null;
    // polite pause
    await new Promise(r=>setTimeout(r, 1200));
  }
  await fs.writeFile(MEMBERS_FILE, JSON.stringify(members, null, 2), 'utf8');
  console.log('Saved members with enrichments to', MEMBERS_FILE);
}

main().catch(e=>{ console.error(e); process.exit(1); });
