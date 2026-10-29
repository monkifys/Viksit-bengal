/**
 * Returns the localized value for a bilingual field.
 */
function getText(obj, field, lang = 'en') {
  const val = obj[`${field}_${lang}`];
  if (val && val.trim() !== '') return val;
  const valEn = obj[`${field}_en`];
  if (valEn && valEn.trim() !== '') return valEn;
  return obj[field] || '';
}

function parseDate(dateStr) {
  if (dateStr instanceof Date) return dateStr;
  if (!dateStr) return new Date();
  
  // Format YYYY-MM-DD
  const yyyymmdd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmdd) {
    return new Date(parseInt(yyyymmdd[1], 10), parseInt(yyyymmdd[2], 10) - 1, parseInt(yyyymmdd[3], 10));
  }
  
  // ISO datetime e.g. YYYY-MM-DDTHH:MM:SS
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }
  
  // D Month YYYY e.g. "4 June 2026"
  const dMonthY = dateStr.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (dMonthY) {
    const months = {
      jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
      may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, september: 8,
      oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11
    };
    const m = months[dMonthY[2].toLowerCase().substring(0, 3)];
    if (m !== undefined) {
      return new Date(parseInt(dMonthY[3], 10), m, parseInt(dMonthY[1], 10));
    }
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date();
}

function formatNumber(num) {
  if (window.LANG === 'bn') {
    const digits = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return String(num).split('').map(d => digits[d] || d).join('');
  }
  return num;
}

(function() {
  if (
    localStorage.getItem('lang') === 'bn' &&
    !window.location.pathname.startsWith('/bn')
  ) {
    window.location.replace('/bn' + window.location.pathname + window.location.search + window.location.hash);
  }
})();

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [metaRes, promisesRes] = await Promise.all([
      fetch((window.DATA_BASE || 'data/') + 'meta.json'),
      fetch((window.DATA_BASE || 'data/') + 'promises.json')
    ]);

    if (!metaRes.ok || !promisesRes.ok) {
      throw new Error('Data files could not be loaded. Serve v2 through a static web server.');
    }

    const meta = await metaRes.json();
    const promises = await promisesRes.json();

    window.LANG = document.documentElement.lang || 'en';
    const LANG = window.LANG;
    localStorage.setItem('lang', window.LANG);

    window.siteData = { meta, promises };
    window.currentFilter = 'all';
    window.autoRotateInterval = null; // Global reference for the ticker interval
    window.latestUpdatesRendered = false; // Flag to prevent DOM-reading layout reflows during load

    document.title = getText(meta, 'title', window.LANG);
    const subElem = document.getElementById('site-subtitle');
    if (subElem) subElem.textContent = getText(meta, 'subtitle', window.LANG);
    
    const discElem = document.getElementById('site-disclaimer');
    if (discElem) {
      const discText = getText(meta, 'disclaimer', window.LANG);
      if (discText) {
        discElem.innerHTML = `<strong>${window.LANG === 'bn' ? 'দাবিত্যাগ:' : 'Disclaimer:'}</strong> ${escapeHtml(discText)}`;
      }
    }

    const lastUpdatedLabel = window.LANG === 'bn' ? 'সর্বশেষ আপডেট: ' : 'Last updated: ';
    const localeStr = window.LANG === 'bn' ? 'bn-IN' : 'en-GB';
    const formattedDate = parseDate(meta.lastUpdated).toLocaleDateString(localeStr, { day: 'numeric', month: 'long', year: 'numeric' });
    const footerUpdated = document.getElementById('last-updated-footer');
    if (footerUpdated) footerUpdated.textContent = lastUpdatedLabel + formatNumber(formattedDate);

    renderMastheadMeta(meta);
    updateTodayDate();
    setInterval(updateTodayDate, 60000);

    const langToggle = document.getElementById('lang-toggle-btn');
    if (langToggle) {
      langToggle.addEventListener('click', () => {
        localStorage.setItem('lang', window.LANG === 'bn' ? 'en' : 'bn');
      });
    }

    initTimer(meta);

    renderNav(meta.categories);
    renderMobileNav(meta.categories);
    renderStats();
    renderLatestUpdates();
    renderKeyPromises();
    renderCategories();
    setupFilters();
    updateFiltersUI();
    updateResultSummary();
    initPromiseSearch(promises);

    // Deep link handling
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      setTimeout(() => scrollToPromise(targetId), 500);
    }

    // Home button handling
    const homeBtn = document.getElementById('fab-home');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.replaceState(null, null, ' ');
      });
    }

  } catch (error) {
    console.error('Failed to load data:', error);
    document.getElementById('categories-container').innerHTML =
      '<div class="loading error-state">Failed to load promises data from database.</div>';
  }
});

// ── MASTHEAD META ─────────────────────────────────────────────────────────
function renderMastheadMeta(meta) {
  const container = document.getElementById('masthead-meta');
  if (!container) return;

  const OATH_DATE = parseDate(meta.oathDate || '2026-05-09');
  const TERM_END = parseDate(meta.termEnd || meta.termEndDate || '2031-05-09T11:00:00+05:30');
  const now = new Date();
  const daysIn = Math.max(1, Math.floor((now - OATH_DATE) / 86400000) + 1);
  const daysLeft = Math.max(0, Math.floor((TERM_END - now) / 86400000));

  const items = window.LANG === 'bn' ? [
    { label: 'মুখ্যমন্ত্রী', value: getText(meta, 'chiefMinister', 'bn') },
    { label: 'শপথ গ্রহণ', value: getText(meta, 'oathCeremony', 'bn') },
    { label: 'মেয়াদ শেষ', value: getText(meta, 'termEnds', 'bn') || 'মে ২০৩১' },
    { label: 'কত দিন ক্ষমতায়', value: formatNumber(daysIn) + ' দিন', id: 'days-in-office' },
    { label: 'কত দিন বাকি', value: formatNumber(daysLeft) + ' দিন', id: 'days-remaining' }
  ] : [
    { label: 'Chief Minister', value: getText(meta, 'chiefMinister', 'en') },
    { label: 'Oath Ceremony', value: getText(meta, 'oathCeremony', 'en') },
    { label: 'Term Ends', value: getText(meta, 'termEnds', 'en') || 'May 2031' },
    { label: 'Days in Office', value: daysIn + (daysIn === 1 ? ' day' : ' days'), id: 'days-in-office' },
    { label: 'Days Remaining', value: daysLeft + ' days', id: 'days-remaining' }
  ];

  container.innerHTML = items.map(item =>
    `<div class="meta-item${item.highlight ? ' meta-highlight' : ''}">
      <span class="meta-label">${escapeHtml(item.label)}</span>
      <span class="meta-value"${item.id ? ` id="${item.id}"` : ''}>${escapeHtml(item.value)}</span>
    </div>`
  ).join('');
}

// ── DATE & TIMER ──────────────────────────────────────────────────────────
function updateTodayDate() {
  const todayEl = document.getElementById('today-date');
  if (!todayEl) return;
  const localeStr = window.LANG === 'bn' ? 'bn-IN' : 'en-IN';
  const formatted = new Date().toLocaleDateString(localeStr, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  todayEl.textContent = window.LANG === 'bn' ? formatNumber(formatted) : formatted;
}

function pad(n) { return String(n).padStart(2, '0'); }

function initTimer(meta) {
  if (!meta) return;
  const OATH_DATE = parseDate(meta.oathDate || '2026-05-09');
  const TERM_END = parseDate(meta.termEnd || meta.termEndDate || '2031-05-09T11:00:00+05:30');

  function updateTimer() {
    const now = new Date();

    // Days in office / remaining
    const daysIn = Math.max(1, Math.floor((now - OATH_DATE) / 86400000) + 1);
    const daysLeft = Math.max(0, Math.floor((TERM_END - now) / 86400000));
    const dioEl = document.getElementById('days-in-office');
    const drEl = document.getElementById('days-remaining');
    if (dioEl) {
      dioEl.textContent = window.LANG === 'bn'
        ? formatNumber(daysIn) + ' দিন'
        : daysIn + (daysIn === 1 ? ' day' : ' days');
    }
    if (drEl) {
      drEl.textContent = window.LANG === 'bn'
        ? formatNumber(daysLeft) + ' দিন'
        : daysLeft + ' days';
    }

    // Countdown to TERM_END
    const diff = TERM_END - now;
    const yEl = document.getElementById('t-years');
    const moEl = document.getElementById('t-months');
    const dEl = document.getElementById('t-days');
    const hEl = document.getElementById('t-hours');
    const miEl = document.getElementById('t-mins');
    const sEl = document.getElementById('t-secs');

    if (!yEl && !moEl && !dEl && !hEl && !miEl && !sEl) return;

    if (diff > 0) {
      const yrs = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
      const rem1 = diff % (365.25 * 24 * 3600 * 1000);
      const mths = Math.floor(rem1 / (30.44 * 24 * 3600 * 1000));
      const rem2 = rem1 % (30.44 * 24 * 3600 * 1000);
      const days = Math.floor(rem2 / (24 * 3600 * 1000));
      const rem3 = rem2 % (24 * 3600 * 1000);
      const hrs = Math.floor(rem3 / (3600 * 1000));
      const mins = Math.floor((rem3 % (3600 * 1000)) / 60000);
      const secs = Math.floor((rem3 % 60000) / 1000);

      if (yEl) yEl.textContent = formatNumber(pad(yrs));
      if (moEl) moEl.textContent = formatNumber(pad(mths));
      if (dEl) dEl.textContent = formatNumber(pad(days));
      if (hEl) hEl.textContent = formatNumber(pad(hrs));
      if (miEl) miEl.textContent = formatNumber(pad(mins));
      if (sEl) sEl.textContent = formatNumber(pad(secs));
    } else {
      [yEl, moEl, dEl, hEl, miEl, sEl].forEach(el => {
        if (el) el.textContent = formatNumber('00');
      });
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function formatInfoText(text) {
  if (!text) return '';
  const escaped = escapeHtml(text);
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const linkLabel = window.LANG === 'bn' ? '↗ লিঙ্ক খুলুন' : '↗ Open Link';
  return escaped.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="nofollow noopener" class="archive-source-link" style="font-family: var(--font-mono); font-size: 10px; margin-left: 2px; padding: 2px 8px; text-transform: uppercase;">${linkLabel}</a>`;
  });
}

function formatCount(count, singular, plural = `${singular}s`) {
  if (window.LANG === 'bn') {
    const formatted = formatNumber(count);
    if (singular === 'Promise') {
      return `${formatted}টি প্রতিশ্রুতি`;
    }
    if (singular === 'update') {
      return `${formatted}টি আপডেট`;
    }
    if (singular === 'counter-note') {
      return `${formatted}টি পাল্টা তথ্য`;
    }
    if (singular === 'note') {
      return `${formatted}টি নোট`;
    }
    if (singular === 'setback') {
      return `${formatted}টি অবনতি`;
    }
    return `${formatted} ${singular}`;
  }
  return `${count} ${count === 1 ? singular : plural}`;
}

const STATUS_DEFINITIONS = {
  not_started: { en: '○ Not Started', bn: '○ শুরু হয়নি', badgeClass: 'badge-pending' },
  announced: { en: '📢 Announced', bn: '📢 ঘোষিত', badgeClass: 'badge-announced' },
  legally_initiated: { en: '⚖ Legally Initiated', bn: '⚖ আইনগতভাবে শুরু', badgeClass: 'badge-legally-initiated' },
  funded: { en: '💰 Funded', bn: '💰 অর্থ বরাদ্দপ্রাপ্ত', badgeClass: 'badge-funded' },
  under_implementation: { en: '◑ Under Implementation', bn: '◑ বাস্তবায়নাধীন', badgeClass: 'badge-progress' },
  partially_delivered: { en: '◐ Partially Delivered', bn: '◐ আংশিক সম্পন্ন', badgeClass: 'badge-partially-delivered' },
  delivered: { en: '✓ Delivered', bn: '✓ সম্পূর্ণ সম্পন্ন', badgeClass: 'badge-done' },
  delayed: { en: '⏳ Delayed', bn: '⏳ বিলম্বিত', badgeClass: 'badge-delayed' },
  reversed: { en: '⃠ Reversed', bn: '⃠ স্থগিত বা বাতিল', badgeClass: 'badge-evaded' },
  disputed: { en: '⚠ Disputed', bn: '⚠ বিতর্কিত', badgeClass: 'badge-disputed' },
  not_verifiable: { en: '❓ Not Verifiable', bn: '❓ যাচাইযোগ্য নয়', badgeClass: 'badge-not-verifiable' }
};

const LEGACY_STATUS_MAP = {
  done: 'delivered',
  inprogress: 'under_implementation',
  pending: 'not_started',
  evaded: 'not_verifiable'
};

function normalizePromiseStatus(status) {
  if (!status) return 'not_started';
  return LEGACY_STATUS_MAP[status] || status;
}

function formatStatus(status) {
  const norm = normalizePromiseStatus(status);
  const def = STATUS_DEFINITIONS[norm];
  if (!def) {
    console.warn(`[Viksit Bengal] Unknown or invalid status: "${status}". Surfacing for review.`);
    return window.LANG === 'bn' ? '⟳ পর্যালোচনাধীন' : '⟳ Review Needed';
  }
  return window.LANG === 'bn' ? def.bn : def.en;
}

function getStatusBadge(status) {
  const norm = normalizePromiseStatus(status);
  const def = STATUS_DEFINITIONS[norm];
  if (!def) {
    const fallbackText = window.LANG === 'bn' ? '⟳ পর্যালোচনাধীন' : '⟳ Review Needed';
    return `<span class="badge badge-review">${fallbackText}</span>`;
  }
  const label = window.LANG === 'bn' ? def.bn : def.en;
  return `<span class="badge ${def.badgeClass}">${label}</span>`;
}

function highlightText(text, highlight) {
  if (!highlight) return escapeHtml(text);
  const full = String(text);
  const idx = full.toLowerCase().indexOf(String(highlight).toLowerCase());
  if (idx < 0) return escapeHtml(full);
  return `${escapeHtml(full.slice(0, idx))}<span class="highlight">${escapeHtml(full.slice(idx, idx + highlight.length))}</span>${escapeHtml(full.slice(idx + highlight.length))}`;
}

function filterPromises(promises) {
  if (!window.currentFilter || window.currentFilter === 'all') return promises;
  return promises.filter((p) => {
    const norm = normalizePromiseStatus(p.status);
    if (window.currentFilter === 'done' || window.currentFilter === 'delivered') {
      return norm === 'delivered';
    }
    if (window.currentFilter === 'inprogress' || window.currentFilter === 'under_implementation') {
      return norm === 'under_implementation' || norm === 'legally_initiated' || norm === 'funded' || norm === 'partially_delivered';
    }
    if (window.currentFilter === 'pending' || window.currentFilter === 'not_started') {
      return norm === 'not_started' || norm === 'announced';
    }
    if (window.currentFilter === 'evaded' || window.currentFilter === 'reversed') {
      return norm === 'reversed' || norm === 'delayed' || norm === 'disputed' || norm === 'not_verifiable';
    }
    return norm === window.currentFilter || p.status === window.currentFilter;
  });
}

function rerenderMain() {
  renderStats();
  renderLatestUpdates(); // Ensure it respects the filter
  renderKeyPromises();
  renderCategories();
  updateResultSummary();
  if (window.siteData && window.siteData.meta) {
    renderNav(window.siteData.meta.categories);
    renderMobileNav(window.siteData.meta.categories);
  }
}

function renderNav(categories) {
  const nav = document.getElementById('desktop-nav');
  const catNav = document.querySelector('.cat-nav');
  if (!nav || !catNav) return;

  // When a filter is active, only show categories that have matching promises
  const visibleCategories = window.currentFilter === 'all'
    ? categories
    : categories.filter(c =>
        window.siteData.promises.some(p => p.category === c.id && p.status === window.currentFilter)
      );

  // Hide the entire nav if fewer than 2 sections are visible under the active filter
  if (window.currentFilter !== 'all' && visibleCategories.length < 2) {
    catNav.style.display = 'none';
    return;
  }
  catNav.style.display = '';

  const key15Link = (window.currentFilter === 'all')
    ? '<a href="#key-15">⭐ 15 Key</a>'
    : '';
  nav.innerHTML =
    key15Link +
    visibleCategories.map((c) => `<a href="#${escapeHtml(c.id)}">${escapeHtml(c.icon)} ${escapeHtml(getText(c, 'title', window.LANG).split(' ')[0])}</a>`).join('');
}

function renderMobileNav(categories) {
  const dropdown = document.getElementById('nav-dropdown');
  const catNav = document.querySelector('.cat-nav');
  if (!dropdown) return;

  // When a filter is active, only show categories that have matching promises
  const visibleCategories = window.currentFilter === 'all'
    ? categories
    : categories.filter(c =>
        window.siteData.promises.some(p => p.category === c.id && p.status === window.currentFilter)
      );

  // Hide the entire nav if fewer than 2 sections are visible under the active filter
  if (catNav) {
    if (window.currentFilter !== 'all' && visibleCategories.length < 2) {
      catNav.style.display = 'none';
      return;
    }
    catNav.style.display = '';
  }

  const key15Link = (window.currentFilter === 'all')
    ? '<a href="#key-15" onclick="closeMobileNav()">⭐ 15 Key Promises</a>'
    : '';

  dropdown.innerHTML =
    key15Link +
    visibleCategories.map((c) => `<a href="#${escapeHtml(c.id)}" onclick="closeMobileNav()">${escapeHtml(c.icon)} ${escapeHtml(getText(c, 'title', window.LANG))}</a>`).join('');

  const trigger = document.getElementById('nav-trigger');
  if (trigger && !trigger.hasAttribute('data-listener-set')) {
    trigger.addEventListener('click', toggleMobileNav);
    trigger.setAttribute('data-listener-set', 'true');
  }

  // Close mobile nav when tapping outside
  if (!window.mobileNavOutsideListenerSet) {
    document.addEventListener('click', function (e) {
      const nav = document.querySelector('.cat-nav-mobile');
      if (nav && !nav.contains(e.target)) closeMobileNav();
    });
    window.mobileNavOutsideListenerSet = true;
  }
}

function toggleMobileNav() {
  const trigger = document.getElementById('nav-trigger');
  const dropdown = document.getElementById('nav-dropdown');
  const isOpen = dropdown.classList.contains('open');
  if (isOpen) {
    dropdown.classList.remove('open');
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  } else {
    dropdown.classList.add('open');
    trigger.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
  }
}

function closeMobileNav() {
  const trigger = document.getElementById('nav-trigger');
  const dropdown = document.getElementById('nav-dropdown');
  if (dropdown) dropdown.classList.remove('open');
  if (trigger) {
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }
}

function renderStats() {
  const allPromises = window.siteData.promises;
  const total = allPromises.length;
  const counts = { done: 0, inprogress: 0, evaded: 0, pending: 0 };
  allPromises.forEach((p) => { counts[p.status] += 1; });

  document.getElementById('stat-total').textContent = formatNumber(total);
  document.getElementById('stat-done').textContent = formatNumber(counts.done);
  document.getElementById('stat-inprogress').textContent = formatNumber(counts.inprogress);
  document.getElementById('stat-evaded').textContent = formatNumber(counts.evaded);
  document.getElementById('stat-pending').textContent = formatNumber(counts.pending);

  // Completion rate (always based on all promises)
  const pct = total > 0 ? Math.round((counts.done / total) * 100) : 0;
  const pctEl = document.getElementById('stat-pct');
  if (pctEl) pctEl.textContent = formatNumber(pct) + '%';

  const donePct = total ? (counts.done / total) * 100 : 0;
  const inProgPct = total ? (counts.inprogress / total) * 100 : 0;
  const evadedPct = total ? (counts.evaded / total) * 100 : 0;
  document.getElementById('bar-done').style.width = `${donePct}%`;
  document.getElementById('bar-inprog').style.width = `${inProgPct}%`;
  document.getElementById('bar-evaded').style.width = `${evadedPct}%`;

  // Compute setbacks and disputes dynamically
  let totalSetbacks = 0;
  let promisesWithSetbacks = 0;
  let disputedDonePromises = 0;

  allPromises.forEach((p) => {
    const sb = p.setbackCount || 0;
    if (sb > 0) {
      totalSetbacks += sb;
      promisesWithSetbacks += 1;
    }
    if (p.status === 'done' && p.resolution === 'Disputed') {
      disputedDonePromises += 1;
    }
  });

  const subNoteEl = document.getElementById('stats-sub-note');
  if (subNoteEl) {
    let html = '';
    if (window.LANG === 'bn') {
      if (totalSetbacks > 0) {
        html += `<div class="stats-sub-note-row"><span class="stats-sub-note-dot"></span><span>মোট <strong>${formatNumber(promisesWithSetbacks)}টি প্রতিশ্রুতির</strong> বিপরীতে <strong>${formatNumber(totalSetbacks)}টি বাধা / অবনতি (setback)</strong> নথিভুক্ত হয়েছে।</span></div>`;
      }
      if (disputedDonePromises > 0) {
        html += `<div class="stats-sub-note-row"><span class="stats-sub-note-dot"></span><span>এবং পূরণকৃত প্রতিশ্রুতির মধ্যে <strong>${formatNumber(disputedDonePromises)}টি প্রতিশ্রুতি বর্তমানে বিতর্কিত (disputed)</strong> হিসেবে চিহ্নিত রয়েছে।</span></div>`;
      }
    } else {
      if (totalSetbacks > 0) {
        html += `<div class="stats-sub-note-row"><span class="stats-sub-note-dot"></span><span>A total of <strong>${totalSetbacks} ${totalSetbacks === 1 ? 'setback' : 'setbacks'}</strong> reported across <strong>${promisesWithSetbacks} ${promisesWithSetbacks === 1 ? 'promise' : 'promises'}</strong>.</span></div>`;
      }
      if (disputedDonePromises > 0) {
        html += `<div class="stats-sub-note-row"><span class="stats-sub-note-dot"></span><span>And <strong>${disputedDonePromises} fulfilled ${disputedDonePromises === 1 ? 'promise is' : 'promises are'} disputed</strong> under public review.</span></div>`;
      }
    }
    subNoteEl.innerHTML = html;
    subNoteEl.style.display = html ? 'flex' : 'none';
  }
}

async function renderLatestUpdates() {
  const section = document.getElementById('dispatch-section');
  const ticker = document.getElementById('dispatch-ticker');
  if (!ticker || !section) return;

  // Hide ticker if any filter is active
  if (window.currentFilter !== 'all') {
    section.style.display = 'none';
    if (window.autoRotateInterval) clearInterval(window.autoRotateInterval);
    return;
  }

  // If already rendered and filter is 'all', just show it (avoids forced layout reflow DOM queries)
  if (window.latestUpdatesRendered) {
    section.style.display = 'block';
    return; 
  }
  
  section.style.display = 'block';

  try {
    const baseDir = window.DATA_BASE || 'data/';
    const [updatesRes, initiativesRes] = await Promise.all([
      fetch(baseDir + 'updates.json'),
      fetch(baseDir + 'initiative_updates.json')
    ]);
    
    let updates = [];
    let initiatives = [];
    
    if (updatesRes.ok) updates = await updatesRes.json();
    if (initiativesRes.ok) initiatives = await initiativesRes.json();
    
    // Mark initiatives
    initiatives = initiatives.map(i => ({ ...i, isInitiative: true }));
    
    const allUpdates = [...updates, ...initiatives];
    
    // Sort by date desc
    allUpdates.sort((a, b) => b.date.localeCompare(a.date));
    
    const latest = allUpdates.slice(0, 10);

    if (!latest.length) {
      section.style.display = 'none';
      return;
    }

    let currentIndex = 0;

    function renderTickerItem(index) {
      const u = latest[index];
      const localeStr = window.LANG === 'bn' ? 'bn-IN' : 'en-IN';
      const dateFormatted = formatNumber(parseDate(u.date).toLocaleDateString(localeStr, { day: 'numeric', month: 'short' }));
      const prefixText = window.LANG === 'bn' ? 'উদ্যোগ' : 'INITIATIVE';
      const metaPrefix = u.isInitiative ? `<span style="color:var(--saffron); font-weight:700">${prefixText}</span> • ` : '';
      const linkHref = u.isInitiative ? `initiatives.html#${u.promiseId}` : `#${u.promiseId}`;
      const linkOnClick = u.isInitiative ? '' : `onclick="scrollToPromise('${escapeHtml(u.promiseId)}')"`;
      const linkText = u.isInitiative
        ? (window.LANG === 'bn' ? 'উদ্যোগের বিবরণ দেখুন →' : 'View Initiative Details →')
        : (window.LANG === 'bn' ? 'প্রতিশ্রুতির সম্পূর্ণ বিবরণ দেখুন →' : 'Read Full Promise Details →');
      
      let catName = u.category;
      if (window.siteData && window.siteData.meta && window.siteData.meta.categories) {
        const foundCat = window.siteData.meta.categories.find(c => c.id === u.category);
        if (foundCat) {
          catName = getText(foundCat, 'title', window.LANG);
        }
      }
      if (!catName) {
        catName = u.category.replace('-', ' ');
      }

      const cleanNoteText = String(getText(u, 'note', window.LANG) || '').replace(/\*\*/g, '');
      const substringText = cleanNoteText.substring(0, 140);
      const isTruncated = cleanNoteText.length > 140;
      
      return `
        <div class="dispatch-item">
          <span class="dispatch-meta">${metaPrefix}${escapeHtml(catName)} • ${dateFormatted}</span>
          <span class="dispatch-text">${escapeHtml(substringText)}${isTruncated ? '...' : ''}</span>
          <a href="${linkHref}" class="dispatch-link" ${linkOnClick}>${linkText}</a>
        </div>
      `;
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % latest.length;
      updateDisplay();
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + latest.length) % latest.length;
      updateDisplay();
    }

    function updateDisplay() {
      const container = document.getElementById('dispatch-ticker');
      const current = container.querySelector('.dispatch-item');
      if (current) {
        current.classList.add('exit');
        current.classList.remove('active');
      }

      setTimeout(() => {
        container.innerHTML = renderTickerItem(currentIndex);
        // Small delay to trigger the entrance animation
        setTimeout(() => {
           const newItem = container.querySelector('.dispatch-item');
           if (newItem) newItem.classList.add('active');
        }, 50);
      }, 400);
    }

    ticker.innerHTML = renderTickerItem(0);
    setTimeout(() => {
        const first = ticker.querySelector('.dispatch-item');
        if (first) first.classList.add('active');
    }, 50);

    window.latestUpdatesRendered = true;

    // Setup Controls
    const nextBtn = document.getElementById('dispatch-next');
    const prevBtn = document.getElementById('dispatch-prev');
    const dispatchCard = document.querySelector('.dispatch-card');

    const startRotation = () => {
        clearInterval(window.autoRotateInterval);
        window.autoRotateInterval = setInterval(showNext, 3500);
    };

    nextBtn.addEventListener('click', () => {
      clearInterval(window.autoRotateInterval);
      showNext();
    });

    prevBtn.addEventListener('click', () => {
      clearInterval(window.autoRotateInterval);
      showPrev();
    });

    // Pause on hover
    dispatchCard.addEventListener('mouseenter', () => clearInterval(window.autoRotateInterval));
    dispatchCard.addEventListener('mouseleave', startRotation);

    startRotation();

  } catch (e) {
    console.error(e);
    ticker.innerHTML = '<div class="loading error-state">Failed to load live feed.</div>';
  }
}

function renderKeyPromises() {
  const grid = document.getElementById('key-promises-grid');
  const section = document.getElementById('key-15');
  const keyPromises = window.siteData.promises
    .filter((p) => p.keyPromise !== null)
    .sort((a, b) => a.keyPromise - b.keyPromise);

  if (!keyPromises.length || window.currentFilter !== 'all') {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  
  // Group promises by keyPromise ID
  const groups = {};
  window.siteData.promises.forEach(p => {
    if (p.keyPromise !== null) {
      if (!groups[p.keyPromise]) groups[p.keyPromise] = [];
      groups[p.keyPromise].push(p);
    }
  });

  const sortedKeys = Object.keys(groups).map(Number).sort((a, b) => a - b);

  const getGroupStatus = (group) => {
    if (group.every(p => p.status === 'done')) return 'done';
    if (group.some(p => p.status === 'inprogress' || p.status === 'done')) return 'inprogress';
    if (group.every(p => p.status === 'evaded')) return 'evaded';
    if (group.some(p => p.status === 'evaded')) return 'inprogress';
    return 'pending';
  };

  const kpBadge = (s) => {
    return formatStatus(s);
  };

  grid.innerHTML = sortedKeys.map(key => {
    const group = groups[key];
    const primary = group[0]; // First promise in group is the scroll target
    const status = getGroupStatus(group);
    const highlightVal = getText(primary, 'highlight', window.LANG);
    const textVal = getText(primary, 'text', window.LANG);
    const maxLen = window.LANG === 'bn' ? 140 : 80;
    const displayStr = highlightVal || (textVal ? (textVal.length > maxLen ? textVal.slice(0, maxLen) + '...' : textVal) : '');
    return `
      <button class="kp-card ${escapeHtml(status)}" type="button" onclick="openKeyPromiseGroup(${key})">
        <span class="kp-num">${escapeHtml(String(key))}</span>
        <p class="kp-text">${escapeHtml(displayStr)}</p>
        <span class="kp-badge">${kpBadge(status)}</span>
      </button>
    `;
  }).join('');
}

function openKeyPromiseGroup(keyNum) {
  if (!window.siteData) return;
  window.currentFilter = 'all';
  updateFiltersUI();
  rerenderMain();

  const group = window.siteData.promises.filter(p => p.keyPromise === keyNum);
  if (!group.length) return;

  // Wait a tiny bit for DOM to be ready after rerender
  setTimeout(async () => {
    for (let i = 0; i < group.length; i++) {
      const p = group[i];
      const el = document.getElementById(`item-${p.id}`);
      if (!el) continue;

      const list = el.closest('.promise-list');
      if (list?.classList.contains('collapsed')) {
        toggleCat(list.previousElementSibling);
      }

      // Expand details drawer first and await the fetch/render
      await togglePromiseDetails(p.id, true);

      el.style.backgroundColor = 'rgba(232, 98, 10, 0.1)';
      setTimeout(() => { el.style.backgroundColor = ''; }, 2000);
    }

    // Scroll to the first promise in the group after all are expanded and layout has settled
    const firstP = group[0];
    const firstEl = document.getElementById(`item-${firstP.id}`);
    if (firstEl) {
      firstEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 50);
}

function renderCategories() {
  const { meta, promises } = window.siteData;
  const filteredPromises = filterPromises(promises);
  const container = document.getElementById('categories-container');

  if (!filteredPromises.length) {
    container.innerHTML = '<div class="loading">No promises match this filter.</div>';
    return;
  }

  let html = '';
  meta.categories.forEach((cat) => {
    const catPromises = filteredPromises.filter((p) => p.category === cat.id);
    if (!catPromises.length) return;

    const completed = catPromises.filter(p => p.status === 'done').length;
    const active = catPromises.filter(p => p.status === 'inprogress').length;

    const parts = [];
    if (window.LANG === 'bn') {
      if (window.currentFilter === 'all') {
        if (completed > 0) parts.push(`${formatNumber(completed)}টি পূর্ণ হয়েছে`);
        if (active > 0) parts.push(`${formatNumber(active)}টি চলছে`);
      }
      parts.push(`${formatNumber(catPromises.length)}টি প্রতিশ্রুতি`);
    } else {
      if (window.currentFilter === 'all') {
        if (completed > 0) parts.push(`${completed} completed`);
        if (active > 0) parts.push(`${active} active`);
      }
      parts.push(`${catPromises.length} ${catPromises.length === 1 ? 'promise' : 'promises'}`);
    }

    const badgeText = parts.join(' · ');

    html += `
      <section class="category" id="${escapeHtml(cat.id)}">
        <div class="cat-header" role="button" tabindex="0" aria-expanded="true" onclick="toggleCat(this)" onkeydown="handleCatKey(event, this)">
          <span class="cat-icon">${escapeHtml(cat.icon)}</span>
          <div class="cat-title-wrap">
            <h2 class="cat-title">${escapeHtml(getText(cat, 'title', window.LANG))}</h2>
            <p class="cat-subtitle">${escapeHtml(getText(cat, 'subtitle', window.LANG))}</p>
          </div>
          <div class="cat-stats"><span class="badge">${escapeHtml(badgeText)}</span></div>
          <span class="cat-toggle">▾</span>
        </div>
        <ul class="promise-list">
          ${catPromises.map((p) => `
            <li class="promise-item ${escapeHtml(p.status)}" id="item-${escapeHtml(p.id)}">
              <span class="promise-num">${escapeHtml(p.number)}</span>
              <div class="promise-content">
                <div class="promise-header">
                  <button class="promise-text ${(p.updateCount > 0 || p.counterCount > 0 || (p.noteCount || 0) > 0) ? 'has-details' : ''}" type="button" ${(p.updateCount > 0 || p.counterCount > 0 || (p.noteCount || 0) > 0) ? `onclick="togglePromiseDetails('${escapeHtml(p.id)}')"` : ''}>${highlightText(getText(p, 'text', window.LANG), getText(p, 'highlight', window.LANG))}</button>
                  <span class="note-tag note-${escapeHtml(p.status)}">${formatStatus(p.status)}</span>
                </div>
                <div class="search-match-reason" id="search-reason-${escapeHtml(p.id)}" style="display:none"></div>
                ${getText(p, 'info', window.LANG) ? `
                  <div class="promise-info-block" style="margin-top: 10px; border-left: 3px solid var(--ink-blue); padding-left: 12px; background: rgba(0, 71, 171, 0.02); padding-top: 8px; padding-bottom: 8px; border-radius: 0 4px 4px 0; font-family: var(--font-sans); font-size: 14.5px; line-height: 1.5; color: var(--ink-mid);">
                    ℹ️ ${formatInfoText(getText(p, 'info', window.LANG))}
                  </div>
                ` : ''}
                ${(p.status === 'done' && getText(p, 'resolutionNote', window.LANG) && p.resolution === 'Done (On Paper)') ? `
                  <div class="resolution-note-done-on-paper">
                    ${window.LANG === 'bn' 
                      ? '📄 <strong>বর্তমানে কাগজে-কলমে সম্পূর্ণ।</strong> আরও জানতে সম্পূর্ণ বিবরণ পাতাটি দেখুন।' 
                      : '📄 <strong>Currently Done (On Paper).</strong> Check Full Details page to know more.'}
                  </div>
                ` : ''}
                ${(getText(p, 'resolutionNote', window.LANG) && p.resolution === 'Disputed') ? `
                  <div class="resolution-note-disputed">
                    ${window.LANG === 'bn' 
                      ? '⚠️ <strong>বিতর্কিত।</strong> আরও জানতে সম্পূর্ণ বিবরণ পাতাটি দেখুন।' 
                      : '⚠️ <strong>Disputed.</strong> Check Full Details page to know more.'}
                  </div>
                ` : ''}
                ${(p.status === 'partially_delivered' || (getText(p, 'resolutionNote', window.LANG) && p.resolution === 'Partial')) ? `
                  <div class="resolution-note-partial">
                    ${p.id === 'health-1' ? (
                      window.LANG === 'bn'
                        ? '◑ <strong>স্বাধীন অডিট পর্যালোচনা স্থিতি — আংশিক সম্পন্ন:</strong><br><span style="display:inline-block;margin-top:4px;">• <strong>বাস্তবায়িত অংশ:</strong> রাজ্য সরকার ও NHA-র মধ্যে সমঝোতা স্মারক (MoU) স্বাক্ষরিত এবং ১.৪৩ কোটি পরিবারের জন্য আয়ুষ্মান ভারত প্রকল্প প্রাতিষ্ঠানিকভাবে চালু করা হয়েছে।</span><br><span style="display:inline-block;margin-top:2px;">• <strong>বাকি/চলমান অংশ:</strong> রাজ্যের বাকি পরিবারগুলির সর্বজনীন কভারেজ, বেসরকারি হাসপাতালের কম প্যাকেজ রেট সংক্রান্ত জটিলতা নিরসন এবং উত্তরবঙ্গে এইমস (AIIMS) স্থাপনের প্রতিশ্রুতি সক্রিয় পর্যালোচনায় রয়েছে।</span>'
                        : '◑ <strong>Independent Audit Review State — Partially Delivered:</strong><br><span style="display:inline-block;margin-top:4px;">• <strong>Implemented Components:</strong> State-NHA MoU officially signed and PM-JAY launched for 1.43M families with initial cashless log-in access.</span><br><span style="display:inline-block;margin-top:2px;">• <strong>Outstanding Commitments:</strong> Universal coverage saturation across all 60M citizens, resolving low package rate disputes with private hospitals, and establishment of North Bengal tertiary healthcare infrastructure (AIIMS) remain ongoing.</span>'
                    ) : (
                      window.LANG === 'bn' 
                        ? '◑ <strong>আংশিকভাবে বাস্তবায়িত।</strong> আরও জানতে সম্পূর্ণ বিবরণ পাতাটি দেখুন।' 
                        : '◑ <strong>Partially Implemented.</strong> Check Full Details page to know more.'
                    )}
                  </div>
                ` : ''}
                ${(getText(p, 'resolutionNote', window.LANG) && p.resolution === 'Deadline Missed') ? `
                  <div class="resolution-note-deadline-missed">
                    ${window.LANG === 'bn' 
                      ? '\u23f3 <strong>\u09b8\u09ae\u09df\u09b8\u09c0\u09ae\u09be \u0985\u09a4\u09bf\u0995\u09cd\u09b0\u09ae \u09b9\u09df\u09c7\u099b\u09c7\u0964</strong> \u0986\u09b0\u0993 \u099c\u09be\u09a8\u09a4\u09c7 \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09ac\u09bf\u09ac\u09b0\u09a3 \u09aa\u09be\u09a4\u09be\u099f\u09bf \u09a6\u09c7\u0996\u09c1\u09a8\u0964' 
                      : '\u23f3 <strong>Deadline Missed.</strong> Check Full Details page to know more.'}
                  </div>
                ` : ''}
                <div class="promise-actions">
                  ${(p.updateCount > 0 || p.counterCount > 0 || (p.noteCount || 0) > 0 || (p.setbackCount || 0) > 0) ? `
                    <button class="promise-meta" type="button" onclick="togglePromiseDetails('${escapeHtml(p.id)}')">
                      ${(() => {
                        const items = [
                          p.updateCount > 0 ? formatCount(p.updateCount, 'update') : '',
                          p.counterCount > 0 ? formatCount(p.counterCount, 'counter-note') : '',
                          (p.noteCount || 0) > 0 ? formatCount(p.noteCount, 'note') : '',
                          (p.setbackCount || 0) > 0 ? `<span class="promise-meta-setback">${formatCount(p.setbackCount, 'setback')}</span>` : ''
                        ].filter(Boolean);
                        
                        return items.map((item, idx) => {
                          const isLast = idx === items.length - 1;
                          const arrow = isLast ? ' <span class="meta-item-arrow">→</span>' : '';
                          return `<span class="meta-item-count">${item}${arrow}</span>`;
                        }).join('');
                      })()}
                    </button>
                  ` : ''}
                  ${(p.status === 'done' || p.status === 'evaded') ? `
                    <a href="details/${escapeHtml(p.id)}.html" class="btn-full-details" onclick="event.stopPropagation();">
                      ${window.LANG === 'bn' ? 'সম্পূর্ণ বিবরণ' : 'Full Details'}
                    </a>
                  ` : ''}
                </div>
                <div class="promise-details" id="details-${escapeHtml(p.id)}"><div class="loading">${window.LANG === 'bn' ? 'বিশদ বিবরণ লোড হচ্ছে...' : 'Loading details...'}</div></div>
              </div>
            </li>
          `).join('')}
        </ul>
      </section>
    `;
  });

  container.innerHTML = html;
}

function clearPromiseSearch() {
  const searchInput = document.getElementById('promise-search-input');
  const clearBtn = document.getElementById('promise-search-clear');
  const hintEl = document.getElementById('promise-search-hint');
  if (searchInput) {
    searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    if (hintEl) {
      hintEl.style.display = 'none';
      hintEl.textContent = '';
    }
  }
}

function setupFilters() {
  document.querySelectorAll('.stat-card[data-filter]').forEach((card) => {
    card.addEventListener('click', () => {
      const filter = card.getAttribute('data-filter');
      window.currentFilter = window.currentFilter === filter ? 'all' : filter;
      clearPromiseSearch();
      updateFiltersUI();
      rerenderMain();
    });
  });
}

window.clearCurrentFilter = () => {
  window.currentFilter = 'all';
  clearPromiseSearch();
  updateFiltersUI();
  rerenderMain();
};

function updateFiltersUI() {
  document.querySelectorAll('.stat-card').forEach((c) => c.classList.remove('active'));
  if (window.currentFilter !== 'all') {
    document.querySelector(`.stat-card[data-filter="${window.currentFilter}"]`)?.classList.add('active');
  }

  const staticGuide = document.getElementById('tracker-guide-static');
  const banner = document.getElementById('active-filters-banner');
  if (!staticGuide || !banner) return;

  if (window.currentFilter === 'all') {
    staticGuide.style.display = 'block';
    banner.style.display = 'none';
    banner.innerHTML = '';
  } else {
    staticGuide.style.display = 'none';
    banner.style.display = 'block';

    const visibleCount = filterPromises(window.siteData.promises).length;
    let badgeHtml = getStatusBadge(window.currentFilter);

    const filteredStatusLabel = window.LANG === 'bn' ? 'ফিল্টার করা অবস্থা:' : 'Filtered Status:';
    const foundSuffix = window.LANG === 'bn' ? 'টি প্রতিশ্রুতি খুঁজে পাওয়া গেছে' : '';
    const promiseFoundText = window.LANG === 'bn'
      ? `— ${formatNumber(visibleCount)}${foundSuffix}`
      : `— ${formatCount(visibleCount, 'Promise')} Found`;
    const clearFilterText = window.LANG === 'bn' ? 'ফিল্টার মুছুন ✕' : 'Clear Filter ✕';

    banner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; width: 100%;">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-family: 'Space Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-faint); font-weight: 700;">${filteredStatusLabel}</span>
          <div class="legend-inline" style="margin: 0; display: inline-flex;">
            ${badgeHtml}
          </div>
          <span style="font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; color: var(--ink-mid); margin-left: 8px;">
            ${promiseFoundText}
          </span>
        </div>
        <button onclick="window.clearCurrentFilter()" style="font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-light); background: var(--surface); border: 1px solid var(--rule); padding: 4px 10px; border-radius: 4px; cursor: pointer; transition: all 0.15s;">
          ${clearFilterText}
        </button>
      </div>
    `;
  }
}

function updateResultSummary() {
  const summary = document.getElementById('result-summary');
  if (summary) {
    summary.style.display = 'none';
  }
}

function toggleCat(header) {
  header.classList.toggle('collapsed');
  header.setAttribute('aria-expanded', String(!header.classList.contains('collapsed')));
  const list = header.nextElementSibling;
  if (list?.classList.contains('promise-list')) list.classList.toggle('collapsed');
}

function handleCatKey(event, header) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  toggleCat(header);
}

async function scrollToPromise(id) {
  window.currentFilter = 'all';
  clearPromiseSearch();
  updateFiltersUI();
  rerenderMain();

  const el = document.getElementById(`item-${id}`);
  if (!el) return;
  const list = el.closest('.promise-list');
  if (list?.classList.contains('collapsed')) toggleCat(list.previousElementSibling);

  // Expand the details drawer first and wait for the fetch and render to complete
  await togglePromiseDetails(id, true);

  // Scroll to the element now that the layout is stable and has its final height
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });

  el.style.backgroundColor = 'rgba(232, 98, 10, 0.1)';
  setTimeout(() => { el.style.backgroundColor = ''; }, 2000);
}



// Initialize global memory cache for details rendering
window.promiseDetailsCache = window.promiseDetailsCache || {};

async function togglePromiseDetails(id, forceOpen = false) {
  const promise = window.siteData.promises.find((p) => p.id === id);
  if (!promise || (promise.updateCount === 0 && promise.counterCount === 0 && (promise.noteCount || 0) === 0 && (promise.setbackCount || 0) === 0)) return;

  const detailsDiv = document.getElementById(`details-${id}`);
  if (!detailsDiv) return;

  const isOpen = detailsDiv.classList.contains('open');
  if (isOpen && !forceOpen) {
    detailsDiv.classList.remove('open');
    return;
  }

  // 1. Render instantly from cache if data is already loaded to avoid layout jumps
  if (window.promiseDetailsCache[id]) {
    detailsDiv.innerHTML = window.promiseDetailsCache[id];
    detailsDiv.classList.add('open');
    return;
  }

  // 2. Fetch and render on first expand
  detailsDiv.innerHTML = '<div class="loading">' + (window.LANG === 'bn' ? 'বিশদ বিবরণ লোড হচ্ছে...' : 'Loading details...') + '</div>';
  detailsDiv.classList.add('open');

  try {
    const baseDir = window.DATA_BASE || 'data/';
    const res = await fetch(`${baseDir}updates/${id}.json`);
    if (!res.ok) throw new Error('No updates file');
    const data = await res.json();

    let html = '<div class="update-timeline">';
    const cleanNote = (note) => String(note || '').replace(/\s*(?:↗|\u00e2\u2020\u2014)[^\n]*$/g, '').trim();
    
    const translateDateLabel = (lbl) => {
      if (!lbl) return '';
      if (window.LANG !== 'bn') return lbl;
      const months = {
        'January': 'জানুয়ারি', 'February': 'ফেব্রুয়ারি', 'March': 'মার্চ',
        'April': 'এপ্রিল', 'May': 'মে', 'June': 'জুন', 'July': 'জুলাই',
        'August': 'আগস্ট', 'September': 'সেপ্টেম্বর', 'October': 'অক্টোবর',
        'November': 'নভেম্বর', 'December': 'ডিসেম্বর',
        'Jan': 'জানু', 'Feb': 'ফেব্রু', 'Mar': 'মার্চ', 'Apr': 'এপ্রিল',
        'Jun': 'জুন', 'Jul': 'জুলাই', 'Aug': 'আগস্ট',
        'Sep': 'সেপ্টে', 'Oct': 'অক্টো', 'Nov': 'নভে', 'Dec': 'ডিসে'
      };
      const digits = {'0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯'};
      let res = lbl;
      for (const [en, bn] of Object.entries(months)) {
        res = res.replace(new RegExp('\\b' + en + '\\b', 'g'), bn);
      }
      for (const [en, bn] of Object.entries(digits)) {
        res = res.replaceAll(en, bn);
      }
      return res;
    };

    const splitIntoSentences = (text) => {
      const sentences = [];
      let currentSentence = '';
      const abbrevs = new Set([
        'no', 'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'vs', 'etc', 'eg', 'ie', 
        'rs', 'govt', 'dept', 'co', 'ltd', 'inc', 'corp', 'st', 'jan', 'feb', 'mar', 
        'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'approx', 'vol', 
        'pp', 'ed', 'gen', 'col', 'sen', 'rep', 'gov', 'ca', 'intl', 'sec', 'art', 
        'dir', 'dist', 'hq', 'dgp', 'sp', 'dm', 'sdm', 'bdo', 'sdo', 'wcd', 'wb', 
        'goa', 'hon', 'pb', 'hr', 'up', 'mp', 'ap', 'tel'
      ]);

      let inBold = false;
      let i = 0;
      while (i < text.length) {
        if (text.startsWith('**', i)) {
          inBold = !inBold;
          currentSentence += '**';
          i += 2;
          continue;
        }
        
        const char = text[i];
        currentSentence += char;

        if (!inBold && (char === '.' || char === '?' || char === '!' || char === '।')) {
          const isLast = (i === text.length - 1);
          const isFollowedBySpace = !isLast && /\s/.test(text[i + 1]);

          if (isLast || isFollowedBySpace) {
            let isSentenceEnd = true;

            if (char === '.') {
              let j = i - 1;
              let word = '';
              while (j >= 0 && /[a-zA-Z0-9.\-]/.test(text[j])) {
                word = text[j] + word;
                j--;
              }
              const cleanedWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
              if (abbrevs.has(cleanedWord)) {
                isSentenceEnd = false;
              }
              if (cleanedWord.length === 1 && /[a-zA-Z]/.test(cleanedWord)) {
                isSentenceEnd = false;
              }
            }

            if (isSentenceEnd) {
              i++;
              while (i < text.length && /["')\]\s]/.test(text[i])) {
                currentSentence += text[i];
                i++;
              }
              sentences.push(currentSentence.trim());
              currentSentence = '';
              continue;
            }
          }
        }
        i++;
      }
      if (currentSentence.trim()) {
        sentences.push(currentSentence.trim());
      }
      return sentences;
    };

    const chunkParagraphs = (text, maxLen = 360) => {
      if (!text) return [];
      const rawParagraphs = String(text).split(/\n\s*\n/);
      const finalParagraphs = [];

      for (const rawP of rawParagraphs) {
        const trimmed = rawP.trim();
        if (!trimmed) continue;

        if (trimmed.length <= maxLen) {
          finalParagraphs.push(trimmed);
          continue;
        }

        const sentences = splitIntoSentences(trimmed);
        let currentGroup = [];
        let currentLen = 0;

        for (const sentence of sentences) {
          if (currentLen > 0 && currentLen + sentence.length > maxLen) {
            finalParagraphs.push(currentGroup.join(' '));
            currentGroup = [sentence];
            currentLen = sentence.length;
          } else {
            currentGroup.push(sentence);
            currentLen += (currentLen > 0 ? 1 : 0) + sentence.length;
          }
        }
        if (currentGroup.length > 0) {
          finalParagraphs.push(currentGroup.join(' '));
        }
      }
      return finalParagraphs;
    };

    // Helper to escape HTML and format multi-paragraph text
    const formatMultiParagraph = (text) => {
      if (!text) return '';
      const paras = chunkParagraphs(String(text), 360);
      return paras
        .map(p => `<p>${escapeHtml(p).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
        .join('');
    };

    const isOverflow = (data.updates.length >= 4);
    const displayUpdates = isOverflow ? data.updates.slice(0, 3) : data.updates;

    // Compute separate numbering for updates vs setbacks (counting from total downward)
    let updateCounter = data.updates.filter(u => u.type !== 'setback').length;
    let setbackCounter = data.updates.filter(u => u.type === 'setback').length;
    // Track per-type counters for displayed items (decrement as we render)
    let updateDisplayNum = updateCounter;
    let setbackDisplayNum = setbackCounter;

    if (Array.isArray(displayUpdates) && displayUpdates.length) {
      displayUpdates.forEach((u, i) => {
        const isSetback = u.type === 'setback';
        const sources = Array.isArray(u.sources) ? u.sources : [];
        const localizedNote = getText(u, 'note', window.LANG);
        const noteText = sources.length ? cleanNote(localizedNote) : String(localizedNote || '');
        const dateLabel = sources.length > 0
          ? translateDateLabel(sources[0].name.split(/[·|]/).pop().trim())
          : '';

        let updateBadgeText;
        if (isSetback) {
          updateBadgeText = window.LANG === 'bn'
            ? `⚠️ অবনতি ${formatNumber(setbackDisplayNum--)}`
            : `⚠️ Setback ${setbackDisplayNum--}`;
        } else {
          updateBadgeText = window.LANG === 'bn'
            ? `আপডেট ${formatNumber(updateDisplayNum--)}`
            : `Update ${updateDisplayNum--}`;
        }

        let updateHtml = `
          <div class="update-block${isSetback ? ' setback-block' : ''}">
            <div class="update-header">
              ${isSetback
                ? `<span class="setback-badge">${updateBadgeText}</span>`
                : `<span class="update-badge">${updateBadgeText}</span>`
              }
              ${dateLabel ? `<span class="update-date">${escapeHtml(dateLabel)}</span>` : ''}
            </div>
            <div class="update-note">${formatMultiParagraph(noteText)}</div>
            ${sources.length ? `<div class="source-list">
              ${sources.map((s) => `<a class="source-link" href="${escapeHtml(s.url)}" target="_blank" rel="nofollow noopener">${escapeHtml(s.name)}</a>`).join('')}
            </div>` : ''}
        `;

        // Handle nested counter evidence
        if (Array.isArray(u.counterEvidence) && u.counterEvidence.length) {
          u.counterEvidence.forEach((c) => {
            const cSources = Array.isArray(c.sources) ? c.sources : [];
            const localizedCText = getText(c, 'text', window.LANG);
            const cNoteText = cSources.length ? cleanNote(localizedCText) : String(localizedCText || '');
            const cLabelLocal = getText(c, 'label', window.LANG) || (window.LANG === 'bn' ? 'বিতর্কিত' : 'Debatable');
            const counterEvidenceHeader = window.LANG === 'bn' ? '🛑 পাল্টা প্রমাণ: ' : '🛑 Counter evidence: ';
            updateHtml += `
              <div class="counter-block" style="margin-top: 12px;">
                <span class="counter-label">${counterEvidenceHeader}${escapeHtml(cLabelLocal)}</span>
                <div class="update-note">${formatMultiParagraph(cNoteText)}</div>
                ${cSources.length ? `<div class="source-list" style="margin-top:8px">
                  ${cSources.map((s) => `<a class="source-link" href="${escapeHtml(s.url)}" target="_blank" rel="nofollow noopener">${escapeHtml(s.name)}</a>`).join('')}
                </div>` : ''}
              </div>
            `;
          });
        }

        // Handle nested additional notes
        if (Array.isArray(u.additionalNotes) && u.additionalNotes.length) {
          u.additionalNotes.forEach((n) => {
            const nSources = Array.isArray(n.sources) ? n.sources : [];
            const localizedNText = getText(n, 'text', window.LANG);
            const nNoteText = nSources.length ? cleanNote(localizedNText) : String(localizedNText || '');
            const nLabelLocal = getText(n, 'label', window.LANG) || (window.LANG === 'bn' ? 'অতিরিক্ত মন্তব্য' : 'Additional Note');
            const noteHeader = window.LANG === 'bn' ? '📌 মন্তব্য: ' : '📌 Note: ';
            updateHtml += `
              <div class="note-block" style="margin-top: 12px; border-left: 3px solid var(--saffron-mid); padding-left: 12px; background: rgba(232, 98, 10, 0.02); border-radius: 0 4px 4px 0; padding-top: 8px; padding-bottom: 8px;">
                <span class="note-label" style="font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; color: var(--saffron-dark); text-transform: uppercase; display: flex; align-items: center; gap: 4px;">${noteHeader}${escapeHtml(nLabelLocal)}</span>
                <div class="update-note" style="margin-top: 6px; font-size: 16px; line-height: 1.5; color: var(--ink-mid);">${formatMultiParagraph(nNoteText)}</div>
                ${nSources.length ? `<div class="source-list" style="margin-top:8px">
                  ${nSources.map((s) => `<a class="source-link" href="${escapeHtml(s.url)}" target="_blank" rel="nofollow noopener">${escapeHtml(s.name)}</a>`).join('')}
                </div>` : ''}
              </div>
            `;
          });
        }

        updateHtml += `</div>`;
        html += updateHtml;
      });
    }

    if (isOverflow) {
      const remainingCount = data.updates.length - 3;
      if (window.LANG === 'bn') {
        html += `
          <div class="overflow-banner">
            <span class="overflow-text">◑ ৩টি সাম্প্রতিক আপডেট দেখানো হচ্ছে। এই প্রতিশ্রুতির জন্য আরও ${formatNumber(remainingCount)}টি পুরোনো আপডেট আছে।</span>
            <a href="details/${escapeHtml(id)}.html" class="btn-view-overflow">সম্পূর্ণ ইতিহাস ও প্রমাণ দেখুন →</a>
          </div>
        `;
      } else {
        html += `
          <div class="overflow-banner">
            <span class="overflow-text">◑ Previewing the 3 latest updates. There are ${remainingCount} older update${remainingCount === 1 ? '' : 's'} for this promise.</span>
            <a href="details/${escapeHtml(id)}.html" class="btn-view-overflow">View Full History & Evidence →</a>
          </div>
        `;
      }
    }

    if (Array.isArray(data.counterEvidence) && data.counterEvidence.length) {
      data.counterEvidence.forEach((c) => {
        const sources = Array.isArray(c.sources) ? c.sources : [];
        const localizedCText = getText(c, 'text', window.LANG);
        const noteText = sources.length ? cleanNote(localizedCText) : String(localizedCText || '');
        const cLabelLocal = getText(c, 'label', window.LANG) || (window.LANG === 'bn' ? 'বিতর্কিত' : 'Debatable');
        const counterEvidenceHeader = window.LANG === 'bn' ? '🛑 পাল্টা প্রমাণ: ' : '🛑 Counter evidence: ';
        html += `
          <div class="counter-block">
            <span class="counter-label">${counterEvidenceHeader}${escapeHtml(cLabelLocal)}</span>
            <div class="update-note">${formatMultiParagraph(noteText)}</div>
            ${sources.length ? `<div class="source-list" style="margin-top:8px">
              ${sources.map((s) => `<a class="source-link" href="${escapeHtml(s.url)}" target="_blank" rel="nofollow noopener">${escapeHtml(s.name)}</a>`).join('')}
            </div>` : ''}
          </div>
        `;
      });
    }

    if (Array.isArray(data.additionalNotes) && data.additionalNotes.length) {
      data.additionalNotes.forEach((n) => {
        const sources = Array.isArray(n.sources) ? n.sources : [];
        const localizedNText = getText(n, 'text', window.LANG);
        const noteText = sources.length ? cleanNote(localizedNText) : String(localizedNText || '');
        const nLabelLocal = getText(n, 'label', window.LANG) || (window.LANG === 'bn' ? 'অতিরিক্ত মন্তব্য' : 'Additional Note');
        const noteHeader = window.LANG === 'bn' ? '📌 মন্তব্য: ' : '📌 Note: ';
        html += `
          <div class="note-block" style="margin-top: 12px; border-left: 3px solid var(--saffron-mid); padding-left: 12px; background: rgba(232, 98, 10, 0.02); border-radius: 0 4px 4px 0; padding-top: 8px; padding-bottom: 8px;">
            <span class="note-label" style="font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; color: var(--saffron-dark); text-transform: uppercase; display: flex; align-items: center; gap: 4px;">${noteHeader}${escapeHtml(nLabelLocal)}</span>
            <div class="update-note" style="margin-top: 6px; font-size: 16px; line-height: 1.5; color: var(--ink-mid);">${formatMultiParagraph(noteText)}</div>
            ${sources.length ? `<div class="source-list" style="margin-top:8px">
              ${sources.map((s) => `<a class="source-link" href="${escapeHtml(s.url)}" target="_blank" rel="nofollow noopener">${escapeHtml(s.name)}</a>`).join('')}
            </div>` : ''}
          </div>
        `;
      });
    }

    if ((!data.updates || !data.updates.length) && (!data.counterEvidence || !data.counterEvidence.length) && (!data.additionalNotes || !data.additionalNotes.length)) {
      const emptyText = window.LANG === 'bn' ? 'এই প্রতিশ্রুতির জন্য এখনও কোনও বিস্তারিত আপদেশের ইতিহাস উপলব্ধ নেই।' : 'No detailed history available for this item yet.';
      html += `<div class="empty-details">${emptyText}</div>`;
    }

    html += '</div>';
    
    // Save generated markup to cache
    window.promiseDetailsCache[id] = html;
    
    // Render markup
    detailsDiv.innerHTML = html;
  } catch {
    const errorHtml = window.LANG === 'bn'
      ? '<div style="color:var(--ink-light);font-size:13px;font-style:italic">এই আইটেমের জন্য বিশদ বিবরণ পাওয়া যায়নি।</div>'
      : '<div style="color:var(--ink-light);font-size:13px;font-style:italic">No detailed history available for this item.</div>';
    window.promiseDetailsCache[id] = errorHtml;
    detailsDiv.innerHTML = errorHtml;
  }
}

// ===== PROMISE SEARCH LOGIC =====
let searchTimeout = null;
let promisesMap = null; // id → promise, built once at init for O(1) lookups

const ORIGINAL_CATEGORY_ORDER = [
  'national-security', 'governance', 'women', 'youth', 'economy', 
  'tea', 'farmers', 'fishery', 'health', 'education', 
  'culture', 'inclusive', 'infrastructure', 'tourism', 'environment'
];

const SUGGESTIONS_SHORTCUTS = [
  { term: 'tea', label_en: 'Tea Gardens ☕', label_bn: 'চা বাগান ☕' },
  { term: 'tram', label_en: 'Kolkata Trams 🚋', label_bn: 'কলকাতা ট্রাম 🚋' },
  { term: 'da', label_en: 'DA Arrears 💵', label_bn: 'বকেয়া ডিএ 💵' },
  { term: 'ayushman', label_en: 'Ayushman Bharat 🏥', label_bn: 'আয়ুষ্মান ভারত 🏥' },
  { term: 'oil', label_en: 'Ashoknagar Oil 🛢️', label_bn: 'অশোকনগর তৈলখনি 🛢️' },
  { term: 'jobs', label_en: 'Employment 💼', label_bn: 'কর্মসংস্থান 💼' },
  { term: 'fencing', label_en: 'Border Fence 🚧', label_bn: 'সীমান্ত বেড়া 🚧' },
  { term: 'women', label_en: 'Women Schemes 👩', label_bn: 'নারী কল্যাণ 👩' },
  { term: 'ucc', label_en: 'Uniform Civil Code ⚖️', label_bn: 'ইউসিসি ⚖️' }
];

function initPromiseSearch(promises) {
  const options = {
    keys: [
      { name: 'text_en', weight: 0.7 },
      { name: 'keywords', weight: 0.3 }
    ],
    threshold: 0.3, // Lowered threshold for tighter fuzzy matching
    distance: 100
  };
  
  if (typeof Fuse !== 'undefined') {
    window.promiseSearchFuse = new Fuse(promises, options);
    window.searchDictionary = buildSearchDictionary(promises);
  } else {
    console.error('Fuse.js not loaded. Search functionality will not be active.');
    return;
  }

  // Build O(1) lookup map once — used in every search and clear cycle
  promisesMap = new Map(promises.map(p => [p.id, p]));

  const searchInput = document.getElementById('promise-search-input');
  const clearBtn = document.getElementById('promise-search-clear');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        handleSearchInput(e);
      }, 150);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        handleSearchInput({ target: { value: '' } });
      }
    });
  }
}

function handleSearchInput(e) {
  const query = e.target.value;
  const clearBtn = document.getElementById('promise-search-clear');

  if (clearBtn) {
    clearBtn.style.display = query ? 'inline-flex' : 'none';
  }

  // If a search is started, clear the active status filter
  if (query && window.currentFilter !== 'all') {
    window.currentFilter = 'all';
    updateFiltersUI();
    // Re-render categories since currentFilter was changed, so we have all cards rendered in DOM
    renderCategories();
    if (window.siteData && window.siteData.meta) {
      renderNav(window.siteData.meta.categories);
      renderMobileNav(window.siteData.meta.categories);
    }
  }

  filterSearchDOM(query);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SYNONYM_MAP = {
  'cha': ['tea', 'chai'],
  'chai': ['tea', 'cha'],
  'tea': ['cha', 'chai'],
  'misti': ['sweet', 'mishti', 'rosogolla', 'rosogolla', 'sweets'],
  'mishti': ['sweet', 'misti', 'rosogolla', 'rosogolla', 'sweets'],
  'sweet': ['mishti', 'misti', 'sweets'],
  'sweets': ['mishti', 'misti', 'sweet'],
  'milk': ['dairy', 'dudh', 'dud'],
  'dudh': ['milk', 'dairy'],
  'dud': ['milk', 'dairy'],
  'goru': ['cattle', 'cow', 'smuggling'],
  'cow': ['goru', 'cattle'],
  'hospital': ['medical', 'swasthya', 'aiims', 'ayush', 'ayushman'],
  'medical': ['hospital', 'swasthya', 'aiims'],
  'swasthya': ['hospital', 'medical', 'ayushman'],
  'job': ['chakri', 'employment', 'vacancies', 'jobs'],
  'jobs': ['chakri', 'employment', 'vacancies', 'job'],
  'chakri': ['job', 'jobs', 'employment'],
  'road': ['rasta', 'highway', 'bridge', 'setu'],
  'rasta': ['road', 'highway'],
  'money': ['taka', 'allowance', 'bhata', 'grant', 'financial'],
  'taka': ['money', 'allowance', 'bhata', 'grant', 'financial']
};

function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function findClosestWord(text, query) {
  if (!text || !query) return null;
  const words = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  let bestWord = null;
  let minDistance = Infinity;

  for (const w of words) {
    if (w.length < 3) continue;
    const dist = getLevenshteinDistance(w, query);
    if (dist < minDistance) {
      minDistance = dist;
      bestWord = w;
    }
  }

  if (bestWord) {
    const maxLen = Math.max(bestWord.length, query.length);
    const ratio = minDistance / maxLen;
    if (ratio <= 0.4) {
      return bestWord;
    }
  }
  return null;
}

const TRANSLITERATED_TERMS = new Set([
  'cha', 'chai', 'misti', 'mishti', 'dudh', 'dud', 'goru', 'swasthya', 'chakri', 'rasta', 'taka', 'bhata'
]);

function highlightSearchAndDefault(text, defaultHighlight, searchTerms, originalQuery) {
  if (!text) return '';
  const full = String(text);

  let before = full;
  let highlightedPart = '';
  let after = '';

  if (defaultHighlight && defaultHighlight.trim() !== '') {
    const idx = full.toLowerCase().indexOf(defaultHighlight.toLowerCase());
    if (idx >= 0) {
      before = full.slice(0, idx);
      highlightedPart = full.slice(idx, idx + defaultHighlight.length);
      after = full.slice(idx + defaultHighlight.length);
    }
  }

  function applySearchHighlight(segment) {
    if (!searchTerms || searchTerms.length === 0 || !segment) {
      return escapeHtml(segment);
    }

    const uniqueTerms = Array.from(new Set(searchTerms.map(t => t.trim().toLowerCase()).filter(t => t.length > 0)));
    if (uniqueTerms.length === 0) {
      return escapeHtml(segment);
    }

    uniqueTerms.sort((a, b) => b.length - a.length);

    const regexParts = uniqueTerms.map(term => {
      const escaped = escapeRegExp(term);
      const isOriginalNonTransliterated = (term === originalQuery && !TRANSLITERATED_TERMS.has(term));
      return isOriginalNonTransliterated ? `\\b${escaped}\\w*` : `\\b${escaped}\\b`;
    });

    const regex = new RegExp(`(${regexParts.join('|')})`, 'gi');

    const parts = segment.split(regex);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return `<span class="search-highlight">${escapeHtml(part)}</span>`;
      } else {
        return escapeHtml(part);
      }
    }).join('');
  }

  const htmlBefore = applySearchHighlight(before);
  const htmlAfter = applySearchHighlight(after);
  let htmlHighlight = escapeHtml(highlightedPart);

  if (highlightedPart) {
    const innerHighlighted = applySearchHighlight(highlightedPart);
    htmlHighlight = `<span class="highlight">${innerHighlighted}</span>`;
  }

  return htmlBefore + htmlHighlight + htmlAfter;
}

function scorePromise(p, q) {
  const query = q.toLowerCase().trim();
  if (!query) return { score: 0, reason: '', matchedTerm: '' };

  const searchTerms = [{ term: query, isSynonym: false }];
  if (SYNONYM_MAP[query]) {
    SYNONYM_MAP[query].forEach(syn => {
      searchTerms.push({ term: syn, isSynonym: true });
    });
  }

  let bestResult = { score: 0, reason: '', matchedTerm: '' };

  for (const { term, isSynonym } of searchTerms) {
    const res = calculateScore(p, term, query, isSynonym);
    if (res.score > bestResult.score) {
      bestResult = res;
    }
  }

  return bestResult;
}

function calculateScore(p, term, originalQuery, isSynonym) {
  const textEn = (p.text_en || '').toLowerCase();
  const catObj = window.siteData && window.siteData.meta && window.siteData.meta.categories
    ? window.siteData.meta.categories.find(c => c.id === p.category)
    : null;
  const categoryTitle = catObj ? getText(catObj, 'title', 'en').toLowerCase() : '';

  const isTransliterated = TRANSLITERATED_TERMS.has(term);
  const disablePrefixFuzzy = isSynonym || isTransliterated;

  const categoryWordRegex = new RegExp('\\b' + escapeRegExp(term) + '\\b', 'i');
  if (p.category === term || categoryWordRegex.test(categoryTitle)) {
    return { score: 100, reason: 'category', matchedTerm: term };
  }

  const exactWordRegex = new RegExp('\\b' + escapeRegExp(term) + '\\b', 'i');

  if (exactWordRegex.test(textEn)) {
    return { score: 70, reason: 'title', matchedTerm: term };
  }
  if (p.keywords) {
    const exactKw = p.keywords.find(kw => kw.toLowerCase() === term);
    if (exactKw) {
      return { score: 60, reason: 'keyword', matchedTerm: exactKw.toLowerCase() };
    }
    const wordKw = p.keywords.find(kw => exactWordRegex.test(kw));
    if (wordKw) {
      return { score: 55, reason: 'keyword', matchedTerm: wordKw.toLowerCase() };
    }
  }

  if (!disablePrefixFuzzy && term.length >= 3) {
    const prefixRegex = new RegExp('\\b' + escapeRegExp(term), 'i');
    if (prefixRegex.test(textEn)) {
      return { score: 30, reason: 'title', matchedTerm: term };
    }
    if (p.keywords) {
      const prefixKw = p.keywords.find(kw => prefixRegex.test(kw));
      if (prefixKw) {
        return { score: 20, reason: 'keyword', matchedTerm: prefixKw.toLowerCase() };
      }
    }
  }

  if (!disablePrefixFuzzy && originalQuery.length >= 4 && window.promiseSearchFuse) {
    const fuseResults = window.promiseSearchFuse.search(originalQuery);
    const found = fuseResults.find(r => r.item.id === p.id);
    if (found) {
      const closestWord = findClosestWord(
        (p.text_en || '') + ' ' + 
        (p.keywords ? p.keywords.join(' ') : ''),
        originalQuery
      );
      return { 
        score: 10 * (1 - found.score), 
        reason: 'fuzzy', 
        matchedTerm: closestWord || originalQuery 
      };
    }
  }

  return { score: 0, reason: '', matchedTerm: '' };
}

function getMatchReasonLabel(reason, term, originalQuery) {
  const isBn = (window.LANG === 'bn');
  
  if (reason === 'fuzzy') {
    const similarText = term !== originalQuery 
      ? (isBn ? ` ("${originalQuery}" এর সাথে মিল সম্পন্ন)` : ` (similar to "${originalQuery}")`)
      : '';
    return isBn 
      ? `📌 সম্ভাব্য মিল: "${term}"${similarText}` 
      : `📌 Fuzzy Match: "${term}"${similarText}`;
  }

  const viaText = term !== originalQuery 
    ? (isBn ? ` ("${originalQuery}" এর মাধ্যমে)` : ` (via "${originalQuery}")`) 
    : '';

  switch (reason) {
    case 'category':
      return isBn ? `📌 বিভাগ মিল: ${term}${viaText}` : `📌 Category Match: ${term}${viaText}`;
    case 'highlight':
      return isBn ? `📌 শিরোনাম মিল: "${term}"${viaText}` : `📌 Title Match: "${term}"${viaText}`;
    case 'title':
      return isBn ? `📌 শিরোনাম মিল: "${term}"${viaText}` : `📌 Title Match: "${term}"${viaText}`;
    case 'keyword':
      return isBn ? `📌 কীওয়ার্ড মিল: "${term}"${viaText}` : `📌 Keyword Match: "${term}"${viaText}`;
    default:
      return '';
  }
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'but', 'you', 'are', 'with', 'this', 'that', 'from', 'will', 'was', 'were', 'has', 'have',
  'had', 'not', 'its', 'their', 'our', 'his', 'her', 'she', 'him', 'who', 'whom', 'which', 'what', 'when', 'where',
  'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very',
  'can', 'will', 'just', 'should', 'would', 'could', 'about', 'above', 'after', 'again', 'against', 'under', 'over'
]);

function buildSearchDictionary(promises) {
  const dictionary = new Set();
  
  // 1. All unique keywords from promises
  promises.forEach(p => {
    if (Array.isArray(p.keywords)) {
      p.keywords.forEach(kw => {
        const clean = kw.trim().toLowerCase();
        if (clean.length >= 3) {
          dictionary.add(clean);
        }
      });
    }
    
    // 2. All words from text_en
    if (p.text_en) {
      const words = p.text_en.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
      words.forEach(w => {
        if (w.length >= 3 && !STOP_WORDS.has(w)) {
          dictionary.add(w);
        }
      });
    }
  });

  // 3. Category IDs & titles
  if (window.siteData && window.siteData.meta && window.siteData.meta.categories) {
    window.siteData.meta.categories.forEach(cat => {
      dictionary.add(cat.id.toLowerCase());
      const title = getText(cat, 'title', 'en').toLowerCase();
      title.split(/\s+/).forEach(w => {
        const clean = w.replace(/[^a-zA-Z]/g, '');
        if (clean.length >= 3 && !STOP_WORDS.has(clean)) {
          dictionary.add(clean);
        }
      });
    });
  }

  // 4. Synonym map keys and values
  if (typeof SYNONYM_MAP !== 'undefined') {
    for (const [key, syns] of Object.entries(SYNONYM_MAP)) {
      dictionary.add(key.toLowerCase());
      syns.forEach(s => dictionary.add(s.toLowerCase()));
    }
  }

  // 5. Suggestions shortcuts
  if (typeof SUGGESTIONS_SHORTCUTS !== 'undefined') {
    SUGGESTIONS_SHORTCUTS.forEach(s => {
      dictionary.add(s.term.toLowerCase());
    });
  }

  return Array.from(dictionary);
}

function getFuzzySuggestions(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 3 || !window.searchDictionary) return [];

  const candidates = [];
  window.searchDictionary.forEach(word => {
    // Skip if identical to query
    if (word === q) return;
    
    const dist = getLevenshteinDistance(q, word);
    const maxLen = Math.max(q.length, word.length);
    const ratio = dist / maxLen;
    
    // Suggest if ratio is <= 0.4 (decent similarity)
    if (ratio <= 0.4) {
      candidates.push({ word, ratio });
    }
  });

  // Sort by ratio ascending (best matches first)
  candidates.sort((a, b) => a.ratio - b.ratio);
  
  // Return unique terms
  return Array.from(new Set(candidates.map(c => c.word))).slice(0, 4);
}

function filterSearchDOM(query) {
  const q = query.trim().toLowerCase();
  const hintEl = document.getElementById('promise-search-hint');
  const container = document.getElementById('categories-container');
  let didYouMeanEl = document.getElementById('promise-search-did-you-mean');

  if (!q) {
    if (didYouMeanEl) {
      didYouMeanEl.style.display = 'none';
      didYouMeanEl.innerHTML = '';
    }

    ORIGINAL_CATEGORY_ORDER.forEach(id => {
      const el = document.getElementById(id);
      if (el && container) {
        container.appendChild(el);
        el.style.display = '';
        const header = el.querySelector('.cat-header');
        const list = el.querySelector('.promise-list');
        if (header && list) {
          header.classList.remove('collapsed');
          header.setAttribute('aria-expanded', 'true');
          list.classList.remove('collapsed');
        }
      }
    });

    document.querySelectorAll('.promise-item').forEach(el => {
      el.style.display = '';
      const id = el.id.replace('item-', '');
      const reasonEl = document.getElementById(`search-reason-${id}`);
      if (reasonEl) {
        reasonEl.style.display = 'none';
        reasonEl.textContent = '';
      }
      const textButton = el.querySelector('.promise-text');
      const p = promisesMap ? promisesMap.get(id) : window.siteData.promises.find(item => item.id === id);
      if (textButton && p) {
        textButton.innerHTML = highlightText(getText(p, 'text', window.LANG), getText(p, 'highlight', window.LANG));
      }
    });

    if (hintEl) {
      hintEl.style.display = 'none';
      hintEl.textContent = '';
    }
    
    updateSearchSuggestions('');
    return;
  }

  const scoredPromises = window.siteData.promises.map(p => {
    const res = scorePromise(p, q);
    return {
      promise: p,
      score: res.score,
      reason: res.reason,
      matchedTerm: res.matchedTerm
    };
  }).filter(item => item.score > 0);

  const matchingIds = new Set(scoredPromises.map(item => item.promise.id));

  const categoryScores = {};
  ORIGINAL_CATEGORY_ORDER.forEach(catId => {
    categoryScores[catId] = 0;
  });

  scoredPromises.forEach(item => {
    const catId = item.promise.category;
    if (item.score > categoryScores[catId]) {
      categoryScores[catId] = item.score;
    }
  });

  const sortedCategoryIds = [...ORIGINAL_CATEGORY_ORDER].sort((a, b) => {
    const scoreA = categoryScores[a] || 0;
    const scoreB = categoryScores[b] || 0;
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return ORIGINAL_CATEGORY_ORDER.indexOf(a) - ORIGINAL_CATEGORY_ORDER.indexOf(b);
  });

  sortedCategoryIds.forEach(catId => {
    const el = document.getElementById(catId);
    if (el && container) {
      container.appendChild(el);
      
      const hasMatches = categoryScores[catId] > 0;
      el.style.display = hasMatches ? '' : 'none';

      if (hasMatches) {
        const header = el.querySelector('.cat-header');
        const list = el.querySelector('.promise-list');
        if (header && list) {
          header.classList.remove('collapsed');
          header.setAttribute('aria-expanded', 'true');
          list.classList.remove('collapsed');
        }
      }
    }
  });

  // O(1) lookup map for matched promises
  const scoredMap = new Map();
  scoredPromises.forEach(item => scoredMap.set(item.promise.id, item));

  document.querySelectorAll('.promise-item').forEach(el => {
    const id = el.id.replace('item-', '');
    const reasonEl = document.getElementById(`search-reason-${id}`);
    const textButton = el.querySelector('.promise-text');

    if (matchingIds.has(id)) {
      el.style.display = '';

      const matchData = scoredMap.get(id);
      if (matchData && reasonEl) {
        const labelText = getMatchReasonLabel(matchData.reason, matchData.matchedTerm, q);
        if (labelText) {
          reasonEl.textContent = labelText;
          reasonEl.style.display = 'inline-block';
        } else {
          reasonEl.style.display = 'none';
        }
      }

      if (textButton) {
        const p = promisesMap ? promisesMap.get(id) : null;
        if (p) {
          const searchTerms = [q];
          if (SYNONYM_MAP[q]) searchTerms.push(...SYNONYM_MAP[q]);
          if (matchData && matchData.matchedTerm && !searchTerms.includes(matchData.matchedTerm)) {
            searchTerms.push(matchData.matchedTerm);
          }
          textButton.innerHTML = highlightSearchAndDefault(
            getText(p, 'text', window.LANG),
            getText(p, 'highlight', window.LANG),
            searchTerms, q
          );
        }
      }
    } else {
      el.style.display = 'none';
      if (reasonEl) {
        reasonEl.style.display = 'none';
        reasonEl.textContent = '';
      }
      // innerHTML not restored here — item is display:none so no paint occurs.
      // The clear path restores it when the user clears the search.
    }
  });

  if (hintEl) {
    const count = matchingIds.size;
    let text = '';
    if (window.LANG === 'bn') {
      const formattedCount = formatNumber(count);
      text = count > 0 
        ? `"${query}" এর সাথে মিল থাকা ${formattedCount}টি প্রতিশ্রুতি দেখানো হচ্ছে`
        : `"${query}" এর সাথে মিল থাকা কোনও প্রতিশ্রুতি পাওয়া যায়নি`;
    } else {
      text = count > 0
        ? `Showing ${count} promise${count > 1 ? 's' : ''} matching "${query}"`
        : `No promises found matching "${query}"`;
    }
    hintEl.textContent = text;
    hintEl.style.display = 'block';
    hintEl.style.color = count > 0 ? '' : 'var(--red)';
  }

  // Create did-you-mean suggestions element if not present
  if (!didYouMeanEl && hintEl) {
    didYouMeanEl = document.createElement('div');
    didYouMeanEl.id = 'promise-search-did-you-mean';
    didYouMeanEl.className = 'promise-search-suggestions';
    didYouMeanEl.style.marginTop = '10px';
    didYouMeanEl.style.display = 'none';
    hintEl.parentNode.insertBefore(didYouMeanEl, hintEl.nextSibling);
  }

  if (matchingIds.size === 0 && q.length >= 3) {
    const suggestions = getFuzzySuggestions(q);
    if (suggestions.length > 0) {
      const label = window.LANG === 'bn' ? 'আপনি কি বোঝাতে চেয়েছেন: ' : 'Did you mean: ';
      didYouMeanEl.innerHTML = `
        <span style="font-family: var(--font-ui); font-size: 13.5px; font-weight: 600; color: var(--ink-mid); display: inline-flex; align-items: center; margin-right: 4px;">${escapeHtml(label)}</span>
        ${suggestions.map(s => `
          <button type="button" class="suggestion-pill" style="font-family: var(--font-ui); text-transform: none; letter-spacing: normal; font-size: 11.5px; padding: 4px 10px;" onclick="applySearchSuggestion('${escapeHtml(s)}')">
            ${escapeHtml(s)}
          </button>
        `).join('')}
      `;
      didYouMeanEl.style.display = 'flex';
    } else {
      didYouMeanEl.style.display = 'none';
      didYouMeanEl.innerHTML = '';
    }
  } else {
    if (didYouMeanEl) {
      didYouMeanEl.style.display = 'none';
      didYouMeanEl.innerHTML = '';
    }
  }

  updateSearchSuggestions(q);
}

function updateSearchSuggestions(query) {
  const container = document.getElementById('promise-search-suggestions');
  if (!container) return;

  if (!query) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  const matches = [];

  // Match category titles
  if (window.siteData && window.siteData.meta && window.siteData.meta.categories) {
    window.siteData.meta.categories.forEach(cat => {
      const title = getText(cat, 'title', window.LANG).toLowerCase();
      if (title.includes(query) && cat.id !== query) {
        const catLabel = window.LANG === 'bn' ? `বিভাগ: ${getText(cat, 'title', 'bn')}` : `Category: ${getText(cat, 'title', 'en')}`;
        matches.push({ term: cat.id, label: catLabel });
      }
    });
  }

  // Predefined shortcuts matching prefix
  SUGGESTIONS_SHORTCUTS.forEach(s => {
    if (s.term.startsWith(query) && s.term !== query) {
      const label = window.LANG === 'bn' ? s.label_bn : s.label_en;
      matches.push({ term: s.term, label: label });
    }
  });

  if (matches.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'flex';
  container.innerHTML = matches.slice(0, 4).map(m => `
    <button type="button" class="suggestion-pill" onclick="applySearchSuggestion('${escapeHtml(m.term)}')">
      ${escapeHtml(m.label)}
    </button>
  `).join('');
}

window.applySearchSuggestion = (term) => {
  const searchInput = document.getElementById('promise-search-input');
  if (searchInput) {
    searchInput.value = term;
    searchInput.focus();
    handleSearchInput({ target: { value: term } });
  }
};