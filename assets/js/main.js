/* ── Keyboard focus utility ──────────────────────────────────── */
const onFirstTab = (e) => {
  if (e.key !== 'Tab') return;
  document.body.classList.add('user-is-tabbing');
  window.removeEventListener('keydown', onFirstTab);
  window.addEventListener('mousedown', onMouseDown);
};
const onMouseDown = () => {
  document.body.classList.remove('user-is-tabbing');
  window.removeEventListener('mousedown', onMouseDown);
  window.addEventListener('keydown', onFirstTab);
};
window.addEventListener('keydown', onFirstTab);

/* ── Navbar scroll state ─────────────────────────────────────── */
const nav       = document.getElementById('nav');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

/* ── Mobile menu ─────────────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('active', open);
  navToggle.setAttribute('aria-expanded', String(open));
  if (!open) dropdownWrap.classList.remove('open');
});

/* ── Projects dropdown ───────────────────────────────────────── */
const dropdownBtn  = document.getElementById('projDropdownBtn');
const dropdownWrap = dropdownBtn.closest('.has-dropdown');

dropdownBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const open = dropdownWrap.classList.toggle('open');
  dropdownBtn.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', () => {
  dropdownWrap.classList.remove('open');
  dropdownBtn.setAttribute('aria-expanded', 'false');
});

dropdownWrap.querySelector('.nav__dropdown').addEventListener('click', (e) => e.stopPropagation());

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  dropdownWrap.classList.remove('open');
  dropdownBtn.setAttribute('aria-expanded', 'false');
  navLinks.classList.remove('open');
  navToggle.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
});

/* ── Tab system ──────────────────────────────────────────────── */
function activateTab(key) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const active = btn.dataset.tab === key;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${key}`);
  });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

/* Dropdown items → activate tab + scroll to section */
document.querySelectorAll('.nav__dropdown-item[data-tab]').forEach(item => {
  item.addEventListener('click', () => {
    activateTab(item.dataset.tab);
    setTimeout(() => {
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
    }, 50);
    dropdownWrap.classList.remove('open');
    dropdownBtn.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
  });
});

/* ── Active nav link on scroll ───────────────────────────────── */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('#navLinks .nav__link[href^="#"]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach(s => observer.observe(s));

navAnchors.forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ── Avatar upload ───────────────────────────────────────────── */
document.getElementById('avatarUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('avatarImg').src = URL.createObjectURL(file);
});

/* ── Load school (GitHub) projects ──────────────────────────── */
const LANG_COLORS = {
  Python:     '#4d9de0',
  Java:       '#e8b84b',
  Go:         '#29c4d4',
  Julia:      '#a270ba',
  JavaScript: '#f0db4f',
  TypeScript: '#3178c6',
  default:    '#6e7681',
};

const CODE_ICON = `
  <svg class="card__img-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="56" height="56" aria-hidden="true">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>`;

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildCard(p) {
  const lang  = p.language || null;
  const color = lang ? (LANG_COLORS[lang] || LANG_COLORS.default) : null;
  const desc  = p.description?.trim() || 'No description provided.';

  const el = document.createElement('article');
  el.className = 'project-card';
  el.innerHTML = `
    <div class="card__img">${CODE_ICON}</div>
    <div class="card__body">
      <span class="card__category">School / Coding</span>
      <h3 class="card__title">
        <a href="${esc(p.html_url)}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a>
      </h3>
      <p class="card__desc">${esc(desc)}</p>
      <div class="card__footer">
        ${lang ? `<span class="badge badge--lang" style="color:${color}">${esc(lang)}</span>` : ''}
        <a href="${esc(p.html_url)}" target="_blank" rel="noopener noreferrer" class="card__link" aria-label="View ${esc(p.name)} on GitHub">
          GitHub
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    </div>`;
  return el;
}

async function loadSchoolProjects() {
  const grid    = document.getElementById('schoolGrid');
  const search  = document.getElementById('searchInput');
  const langSel = document.getElementById('langFilter');
  let all = [];

  try {
    const res = await fetch('data/projects.json');
    all = await res.json();
  } catch {
    grid.innerHTML = `<p style="color:var(--muted);padding:4px 0">
      Unable to load projects.
      <a href="https://github.com/CSW04-exe" target="_blank" rel="noopener" style="color:var(--azure)">View on GitHub ↗</a>
    </p>`;
    return;
  }

  const langs = [...new Set(all.map(p => p.language).filter(Boolean))].sort();
  langs.forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = lang;
    langSel.appendChild(opt);
  });

  function render(list) {
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = '<p style="color:var(--muted);padding:4px 0">No projects match.</p>';
      return;
    }
    list.forEach(p => grid.appendChild(buildCard(p)));
  }

  function filter() {
    const q    = search.value.toLowerCase().trim();
    const lang = langSel.value;
    render(all.filter(p => {
      const hay = `${p.name} ${p.description || ''} ${p.language || ''}`.toLowerCase();
      return (!q || hay.includes(q)) && (!lang || p.language === lang);
    }));
  }

  search.addEventListener('input', filter);
  langSel.addEventListener('change', filter);
  render(all);
}

loadSchoolProjects();
