// script.js — render projects, fetch README excerpts on demand
const API_RAW = (owner,repo,branch='main')=>`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
const owner = 'CSW04-exe';

async function loadProjects(){
  const res = await fetch('data/projects.json');
  const projects = await res.json();
  renderProjects(projects);
  populateLanguages(projects);
}

function populateLanguages(projects){
  const langSet = new Set(projects.map(p=>p.language).filter(Boolean));
  const sel = document.getElementById('languageFilter');
  [...langSet].sort().forEach(l=>{
    const opt = document.createElement('option'); opt.value=l; opt.textContent=l; sel.appendChild(opt);
  })
}

function renderProjects(projects){
  const container = document.getElementById('projects'); container.innerHTML='';
  projects.forEach(p=>{
    const card = document.createElement('article'); card.className='card';
    const title = document.createElement('h3');
    const a = document.createElement('a'); a.href=p.html_url; a.target='_blank'; a.rel='noopener'; a.textContent=p.name;
    title.appendChild(a);
    const desc = document.createElement('p'); desc.textContent = p.description || 'No description provided.';
    const meta = document.createElement('div'); meta.className='meta'; meta.innerHTML = `<span>${p.language||'—'}</span><span><button data-repo='${p.name}' class='fetch-readme'>Show README</button></span>`;
    const readme = document.createElement('div'); readme.className='readme'; readme.id = `readme-${p.name}`; readme.hidden = true;
    card.append(title, desc, meta, readme);
    container.appendChild(card);
  });
  // attach readme buttons
  document.querySelectorAll('.fetch-readme').forEach(btn=>btn.addEventListener('click', async e=>{
    const repo = e.currentTarget.dataset.repo;
    const box = document.getElementById('readme-'+repo);
    if(!box.hidden){ box.hidden=true; box.innerHTML=''; e.currentTarget.textContent='Show README'; return; }
    e.currentTarget.textContent='Loading...'; box.hidden=false;
    const text = await fetchReadme(owner, repo);
    box.innerHTML = `<pre style="white-space:pre-wrap">${escapeHtml(truncate(text, 1500))}</pre>`;
    e.currentTarget.textContent='Hide README';
  }));
}

async function fetchReadme(owner, repo){
  let txt = '';
  try{ 
    let res = await fetch(API_RAW(owner,repo,'main'));
    if(res.status===404) res = await fetch(API_RAW(owner,repo,'master'));
    if(!res.ok) return 'README not available via raw content. Open the repo link to view it.';
    txt = await res.text();
  }catch(err){
    return 'Failed to fetch README: '+err.message;
  }
  return txt;
}

function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function truncate(s,n){ return s.length>n? s.slice(0,n)+'\n\n... (truncated)': s; }

// search & filter
document.getElementById('search').addEventListener('input', e=>applyFilters());
document.getElementById('languageFilter').addEventListener('change', e=>applyFilters());
async function applyFilters(){
  const q = document.getElementById('search').value.toLowerCase();
  const lang = document.getElementById('languageFilter').value;
  const res = await fetch('data/projects.json');
  const projects = await res.json();
  const filtered = projects.filter(p=>{
    const inQ = !q || (p.name+p.description+(p.language||'')).toLowerCase().includes(q);
    const inLang = !lang || (p.language||'')===lang;
    return inQ && inLang;
  });
  renderProjects(filtered);
}

// avatar upload preview
const avatarUpload = document.getElementById('avatarUpload');
avatarUpload.addEventListener('change', e=>{
  const f = e.target.files[0]; if(!f) return;
  const url = URL.createObjectURL(f);
  document.getElementById('avatarImg').src = url;
});

loadProjects().catch(err=>console.error(err));
