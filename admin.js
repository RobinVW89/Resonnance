// admin.js — CRUD client, import/export CSV/JSON

// Detect API availability and fetch members accordingly
let apiMode = false;
async function checkApi(){
  try{
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), 3000);
    const res = await apiFetch('/api/members', { signal: ctrl.signal });
    clearTimeout(timer);
    if(res && res.ok) { apiMode = true; return true; }
  }catch(e){ /* no-op */ }
  apiMode = false; return false;
}

// --- API auth helpers ---
function getAuthHeader(){
  // Read credentials only from input fields (do not persist in localStorage)
  const tokenInput = (document.getElementById('apiToken') && document.getElementById('apiToken').value) || '';
  if(tokenInput) return 'Bearer ' + tokenInput;
  const userInput = (document.getElementById('apiUser') && document.getElementById('apiUser').value) || '';
  const passInput = (document.getElementById('apiPass') && document.getElementById('apiPass').value) || '';
  if(userInput && passInput) return 'Basic ' + btoa(userInput + ':' + passInput);
  return null;
}

function apiFetch(path, opts){
  opts = opts || {};
  opts.headers = Object.assign({}, opts.headers || {});
  const auth = getAuthHeader();
  if(auth) opts.headers['Authorization'] = auth;
  return fetch(path, opts);
}

async function fetchMembers(){
  if(await checkApi()){
    try{ const r = await apiFetch('/api/members'); if(r.ok) return await r.json(); }
    catch(e){ console.error('API fetch error', e); }
  }
  // fallback
  try{
    const res = await fetch('data/members.json');
    if(!res.ok) throw new Error('Fetch failed');
    return await res.json();
  }catch(e){
    console.error('Erreur chargement members.json',e);
    return [];
  }
}

function download(filename, content, mime='application/json'){
  const blob = new Blob([content], {type: mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function toCsv(items){
  if(!items || items.length===0) return '';
  const keys = ['id','name','company','category','role','photo','bio','linkedin'];
  const lines = [keys.join(',')];
  items.forEach(it => {
    const row = keys.map(k => {
      const v = it[k] == null ? '' : String(it[k]);
      // escape quotes
      return '"' + v.replace(/"/g, '""') + '"';
    });
    lines.push(row.join(','));
  });
  return lines.join('\n');
}

function parseCsv(text){
  // Simple CSV parser that handles quoted fields
  const rows = [];
  const re = /(?:\s*\n\s*|\r\n|\n)/; // we'll split lines carefully
  // We'll use a state machine
  const lines = text.split(/\r?\n/);
  const data = lines.map(line => {
    const cells = [];
    let cur = '';
    let inQuotes = false;
    for(let i=0;i<line.length;i++){
      const ch = line[i];
      if(ch==='"'){
        if(inQuotes && line[i+1]==='"'){ cur += '"'; i++; } else { inQuotes = !inQuotes; }
      } else if(ch===',' && !inQuotes){
        cells.push(cur); cur = '';
      } else { cur += ch; }
    }
    cells.push(cur);
    return cells;
  });
  return data;
}

// DOM helpers
const tableBody = document.querySelector('#adminTable tbody');
const memberForm = document.getElementById('memberForm');
const inputs = ['memberId','name','company','role','category','photo','linkedin','bio'].reduce((acc,id)=>{acc[id]=document.getElementById(id);return acc;},{})
const adminMessage = document.getElementById('adminMessage');
const adminSearch = document.getElementById('adminSearch');

let members = [];
let filtered = [];

function renderTable(list){
  tableBody.innerHTML = '';
  list.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.id}</td>
      <td>${escapeHtml(m.name || '')}</td>
      <td>${escapeHtml(m.company || '')}</td>
      <td>${escapeHtml(m.role || '')}</td>
      <td>${escapeHtml(m.category || '')}</td>
      <td>${m.linkedin? `<a href="${escapeHtml(m.linkedin)}" target="_blank">LinkedIn</a>` : ''}</td>
      <td>
        <button class="small-btn" data-action="edit" data-id="${m.id}">Éditer</button>
        <button class="small-btn danger" data-action="delete" data-id="${m.id}">Supprimer</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

function message(msg, isError=false){ adminMessage.textContent = msg; adminMessage.className = isError? 'danger' : 'notice'; }

// Show detailed server response in the adminMessage area
async function parseResponseBody(res){
  if(!res) return null;
  const ct = res.headers && res.headers.get ? res.headers.get('content-type') || '' : '';
  try{
    if(ct.includes('application/json')) return await res.json();
    return await res.text();
  }catch(e){
    try{ return await res.text(); }catch(e2){ return null; }
  }
}

function showServerResponse(res, body){
  const now = new Date().toLocaleTimeString();
  if(!res){ adminMessage.textContent = `[${now}] Erreur réseau ou serveur injoignable.`; adminMessage.className = 'danger'; return; }
  const status = `${res.status} ${res.statusText || ''}`.trim();
  let textBody = '';
  if(body != null){
    if(typeof body === 'string') textBody = body;
    else {
      try{ textBody = JSON.stringify(body); }catch(e){ textBody = String(body); }
    }
  }
  const short = textBody && textBody.length>300 ? textBody.slice(0,300)+"..." : textBody;
  adminMessage.textContent = `[${now}] Serveur: ${status} ${ short ? '— ' + short : '' }`;
  adminMessage.className = res.ok ? 'notice' : 'danger';
}

function showNetworkError(err){ const now=new Date().toLocaleTimeString(); adminMessage.textContent=`[${now}] Erreur réseau: ${err && err.message?err.message:err}`; adminMessage.className='danger'; }

function resetForm(){ memberForm.reset(); inputs.memberId.value=''; }

function bindTableActions(){
  // Use event delegation on tbody to handle buttons after re-renders.
  if(tableBody._delegateAttached) return;
  tableBody.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn || !tableBody.contains(btn)) return;
    const id = btn.dataset.id;
    const act = btn.dataset.action;
    if(!act) return;
    if(act==='edit') return loadMemberToForm(id);
    if(act==='delete') return deleteMember(id);
  });
  tableBody._delegateAttached = true;
}

function loadMemberToForm(id){
  const m = members.find(x=>String(x.id)===String(id));
  if(!m) return;
  inputs.memberId.value = m.id;
  inputs.name.value = m.name || '';
  inputs.company.value = m.company || '';
  inputs.role.value = m.role || '';
  inputs.category.value = m.category || '';
  inputs.photo.value = m.photo || '';
  inputs.linkedin.value = m.linkedin || '';
  inputs.bio.value = m.bio || '';
}

async function deleteMember(id){
  // non-blocking confirmation modal
  const ok = await showConfirm('Supprimer ce membre ?');
  if(!ok) return;
  if(apiMode){
    try{
      const r = await apiFetch(`/api/members/${id}`, { method: 'DELETE' });
      const body = await parseResponseBody(r);
      showServerResponse(r, body);
      if(!r.ok) return;
      members = members.filter(m => String(m.id)!==String(id)); applyFilter();
    }catch(err){ console.error(err); showNetworkError(err); members = members.filter(m => String(m.id)!==String(id)); applyFilter(); }
  } else {
    members = members.filter(m => String(m.id)!==String(id));
    applyFilter();
    message('Membre supprimé. N’oubliez pas de télécharger le JSON pour persister.');
  }
}

function applyFilter(){
  const q = (adminSearch.value||'').toLowerCase();
  filtered = members.filter(m => {
    const hay = [m.name,m.company,m.category,m.role,m.bio].map(x=>String(x||'').toLowerCase()).join(' ');
    return hay.includes(q);
  });
  renderTable(filtered);
  bindTableActions();
}

async function upsertMemberFromForm(){
  const idVal = inputs.memberId.value;
  let id = idVal ? Number(idVal) : (members.reduce((max,m)=>Math.max(max,m.id||0),0)+1);
  const obj = {
    id,
    name: inputs.name.value.trim(),
    company: inputs.company.value.trim(),
    role: inputs.role.value.trim(),
    category: inputs.category.value.trim(),
    photo: inputs.photo.value.trim(),
    linkedin: inputs.linkedin.value.trim(),
    bio: inputs.bio.value.trim()
  };
  // validate name
  if(!obj.name){ message('Le nom est requis', true); return; }
  // if exists, replace
  const idx = members.findIndex(m=>String(m.id)===String(id));
  if(apiMode){
    // use API
    if(idx>=0){
      try{
        const r = await apiFetch(`/api/members/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(obj) });
        const body = await parseResponseBody(r);
        showServerResponse(r, body);
        if(r.ok){ members[idx]= (typeof body === 'object' && body !== null) ? body : obj; resetForm(); applyFilter(); }
      }catch(err){ console.error(err); showNetworkError(err); members[idx]=obj; resetForm(); applyFilter(); }
    } else {
      try{
        const r = await apiFetch('/api/members', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(obj) });
        const body = await parseResponseBody(r);
        showServerResponse(r, body);
        if(r.ok){ members.push( (typeof body === 'object' && body !== null) ? body : obj ); resetForm(); applyFilter(); }
      }catch(err){ console.error(err); showNetworkError(err); members.push(obj); resetForm(); applyFilter(); }
    }
  } else {
    if(idx>=0){ members[idx]=obj; message('Membre mis à jour.'); }
    else { members.push(obj); message('Membre ajouté.'); }
    resetForm(); applyFilter();
  }
}

// Save all members to server (overwrite)
async function saveToServer(){
  if(!apiMode){ message('API non disponible. Démarrez le serveur API (npm start).', true); return; }
  try{
    const res = await apiFetch('/api/members/save', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(members) });
    const body = await parseResponseBody(res);
    showServerResponse(res, body);
    if(!res.ok) return;
    if(body && body.success) message('Liste sauvegardée sur serveur.');
  }catch(e){ console.error(e); message('Erreur sauvegarde serveur.', true); }
}

// Trigger enrich-batch on server
async function enrichOnServer(){
  if(!apiMode){ message('API non disponible. Démarrez le serveur API (npm start).', true); return; }
  const okEnrich = await showConfirm("Cette action va tenter de récupérer métadonnées LinkedIn pour les membres disposant d'un lien LinkedIn. Continuer ?");
  if(!okEnrich) return;
  try{
    const res = await apiFetch('/api/enrich-batch', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({}) });
    const body = await parseResponseBody(res);
    showServerResponse(res, body);
    if(!res.ok) return;
    message('Enrichissement terminé (voir console pour détails).');
    // refresh members from server
    try{ const r2 = await apiFetch('/api/members'); const b2 = await parseResponseBody(r2); if(r2.ok && Array.isArray(b2)){ members = b2; applyFilter(); } }
    catch(e){ console.error(e); }
  }catch(e){ console.error(e); message('Erreur lors de l\'enrichissement.', true); }
}

function importCsvText(text){
  const rows = parseCsv(text);
  if(rows.length<2) { message('CSV vide ou invalide', true); return; }
  const header = rows[0].map(h=>h.trim());
  const expected = ['id','name','company','category','role','photo','bio','linkedin'];
  // Map rows
  const newItems = [];
  for(let i=1;i<rows.length;i++){
    const row = rows[i];
    if(row.length===1 && row[0].trim()==='') continue; // skip empty
    const obj = {};
    for(let j=0;j<header.length;j++){
      obj[header[j]] = row[j] != null ? row[j].trim() : '';
    }
    // ensure id numeric
    obj.id = obj.id ? Number(obj.id) : (members.reduce((max,m)=>Math.max(max,m.id||0),0)+1);
    newItems.push(obj);
  }
  // merge: replace by id or append
  newItems.forEach(it => {
    const idx = members.findIndex(m=>String(m.id)===String(it.id));
    if(idx>=0) members[idx] = Object.assign({}, members[idx], it);
    else members.push(it);
  });
  applyFilter(); message(`Import CSV: ${newItems.length} lignes traitées. Pensez à télécharger le JSON pour persister.`);
}

// Event wiring
document.addEventListener('DOMContentLoaded', async ()=>{
  members = await fetchMembers();
  applyFilter();
  // save
  document.getElementById('saveMember').addEventListener('click', (e)=>{ e.preventDefault(); upsertMemberFromForm(); });
  document.getElementById('resetForm').addEventListener('click', (e)=>{ e.preventDefault(); resetForm(); });
  adminSearch.addEventListener('input', ()=> applyFilter());

  document.getElementById('importCsvBtn').addEventListener('click', ()=> document.getElementById('fileInput').click());
  document.getElementById('fileInput').addEventListener('change', (e)=>{
    const f = e.target.files[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = ()=> importCsvText(reader.result);
    reader.readAsText(f,'utf-8');
  });

  document.getElementById('downloadJsonBtn').addEventListener('click', ()=>{
    download('members-export.json', JSON.stringify(members, null, 2), 'application/json');
  });

  document.getElementById('downloadCsvBtn').addEventListener('click', ()=>{
    const csv = toCsv(members);
    download('members-export.csv', csv, 'text/csv');
  });

  // save to server
  const saveBtn = document.getElementById('saveServerBtn');
  if(saveBtn) saveBtn.addEventListener('click', ()=> saveToServer());

  // enrich on server
  const enrichBtn = document.getElementById('enrichBtn');
  if(enrichBtn) enrichBtn.addEventListener('click', ()=> enrichOnServer());

  // small UI hint if API is available
  if(apiMode) message('Mode API détecté — les opérations modifient directement le serveur.');

  // populate API credentials fields from localStorage
  // Do not auto-populate credentials from localStorage for security
  const userEl = document.getElementById('apiUser');
  const passEl = document.getElementById('apiPass');
  if(userEl) userEl.value = '';
  if(passEl) passEl.value = '';

  const saveCredsBtn = document.getElementById('saveApiCredsBtn');
  if(saveCredsBtn){
    saveCredsBtn.addEventListener('click', ()=>{
      const u = (document.getElementById('apiUser')||{}).value || '';
      const p = (document.getElementById('apiPass')||{}).value || '';
      if(!u || !p){ message('Entrez user et mot de passe API avant d’enregistrer.', true); return; }
      // Do not persist credentials; keep in inputs for this session only
      message('Credentials API pris en compte pour cette session. Réessayez l’opération API.');
      // re-check API with new creds
      checkApi().then(ok=>{ if(ok) message('Mode API détecté — authentifié.'); else message('Impossible d’atteindre l’API avec ces credentials.', true); });
    });
  }

  // generate token button: base64(user:pass)
  const genBtn = document.getElementById('genTokenBtn');
  const tokenEl = document.getElementById('apiToken');
  if(genBtn){
    genBtn.addEventListener('click', ()=>{
      const u = (document.getElementById('apiUser')||{}).value || localStorage.getItem('apiUser') || '';
      const p = (document.getElementById('apiPass')||{}).value || '';
      if(!u || !p){ message('Entrez user et mot de passe pour générer le token.', true); return; }
      const tok = btoa(u + ':' + p);
      if(tokenEl) tokenEl.value = tok;
      message('Token généré pour cette session. Il sera utilisé pour les requêtes API (Bearer/x-api-key).');
      // re-check
      checkApi().then(ok=>{ if(ok) message('Mode API détecté — authentifié via token.'); else message('Impossible d’atteindre l’API avec ce token.', true); });
    });
  }
  // populate token field from storage
  if(tokenEl) tokenEl.value = '';

});

// Modal confirm helper
function showConfirm(message){
  return new Promise((resolve)=>{
    const modal = document.getElementById('confirmModal');
    const msg = document.getElementById('confirmModalMessage');
    const yes = document.getElementById('confirmYes');
    const no = document.getElementById('confirmNo');
    if(!modal || !yes || !no || !msg){ resolve(window.confirm(message)); return; }
    msg.textContent = message;
    modal.style.display = 'flex';
    // handlers
    function clean(){
      modal.style.display = 'none';
      yes.removeEventListener('click', onYes);
      no.removeEventListener('click', onNo);
      window.removeEventListener('keydown', onKey);
    }
    function onYes(){ clean(); resolve(true); }
    function onNo(){ clean(); resolve(false); }
    function onKey(e){ if(e.key==='Escape'){ clean(); resolve(false); } }
    yes.addEventListener('click', onYes);
    no.addEventListener('click', onNo);
    window.addEventListener('keydown', onKey);
    // focus yes for keyboard
    yes.focus();
  });
}
