// ==UserScript==
// @name         HeliosSuite — Aegis (motywy) + HeliosPulse (raporty) + Panel ustawień
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.0
// @description  Jeden panel: motywy UI (Aegis), obecność i raporty (HeliosPulse), centralne ustawienia (a’la GCRT). Bez placeholderów, działa od razu.
// @author       KID6767
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @exclude      https://forum*.grepolis.*
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
  'use strict';

  /** =========================
   *  UTIL & PERSIST
   *  ========================= */
  const Store = {
    get(k, def=null){ try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch(_) { return def; } },
    set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  };
  const cfgKey = 'HSU_CONFIG_v1';
  const defaultConfig = {
    // HeliosPulse
    WEBAPP_URL: "",     // np. https://script.google.com/macros/s/XXXXX/exec
    TOKEN: "HeliosPulseToken",
    ALLIANCE: "Legioniści Heliosa",
    // Theme
    THEME: "classic",   // classic | remaster | pirate | dark
    // GF-style panel toggles (tu możesz dodawać kolejne moduły)
    modules: {
      showStatsDelta: true,
      showAllianceTotals: true,
      showPresenceToday: true
    }
  };
  let CONFIG = Object.assign({}, defaultConfig, Store.get(cfgKey, {}));
  function saveConfig() { Store.set(cfgKey, CONFIG); }

  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function on(el, ev, fn){ el && el.addEventListener(ev, fn, false); }

  function log(...a){ console.log('[HeliosSuite]', ...a); }

  /** =========================
   *  CONTEXT: player nick
   *  ========================= */
  function getPlayerNick(){
    try {
      // Szukamy globalek Grepolis (różne buildy):
      if (window.Game && window.Game.player_name) return String(window.Game.player_name);
      if (window.Game && window.Game.player_name_cache) return String(window.Game.player_name_cache);
      // Nagłówek UI?
      const nickEl = document.querySelector('#ui_box .player_name, .ui_box .player_name');
      if (nickEl) return nickEl.textContent.trim();
      // Ostatecznie prosimy raz
      let cached = Store.get('HSU_NICK', null);
      if (!cached){
        cached = prompt('Podaj swój nick w Grepolis (zapiszę go lokalnie dla HeliosPulse):') || 'Unknown';
        Store.set('HSU_NICK', cached);
      }
      return cached;
    } catch(_){ return 'Unknown'; }
  }
  const PLAYER_NICK = getPlayerNick();

  /** =========================
   *  THEMES (Aegis)
   *  ========================= */
  const THEME_CLASS = {
    classic: 'hsu-theme-classic',
    remaster:'hsu-theme-remaster',
    pirate:  'hsu-theme-pirate',
    dark:    'hsu-theme-dark'
  };

  const THEME_CSS = `
  :root {
    --hsu-font: "Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial;
    --hsu-radius: 12px;
    --hsu-shadow: 0 10px 30px rgba(0,0,0,.3);
  }
  /* Panel / modal */
  .hsu-btn { cursor:pointer; user-select:none; border:none; border-radius:var(--hsu-radius); padding:10px 14px; font-weight:600 }
  .hsu-chip { display:inline-flex; align-items:center; gap:8px; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:600; }
  .hsu-badge { display:inline-block; border-radius:8px; padding:2px 6px; font-size:11px; font-weight:700; }

  .hsu-floating-toggle {
    position: fixed; left: 12px; bottom: 18px; z-index: 999999;
    background: #1f1f1f; color:#ffd86a; border:1px solid rgba(255,216,106,.25);
    box-shadow: var(--hsu-shadow);
    border-radius: 14px; padding:9px 12px; display:flex; align-items:center; gap:10px;
    font: 600 14px var(--hsu-font); transition: transform .15s ease;
  }
  .hsu-floating-toggle:hover { transform: translateY(-1px) }

  .hsu-modal {
    position: fixed; inset: 0; z-index: 999998; display:none;
    background: rgba(0,0,0,.45); backdrop-filter: blur(4px);
  }
  .hsu-modal.open { display:block; }
  .hsu-card {
    width: min(980px, 92vw); max-height: 84vh; overflow:auto;
    margin: 6vh auto 0; background: #131313; color: #eee; border-radius: 16px;
    box-shadow: var(--hsu-shadow); border:1px solid rgba(255,255,255,.08);
    font-family: var(--hsu-font);
  }
  .hsu-card header {
    padding: 18px 20px; border-bottom:1px solid rgba(255,255,255,.08);
    display:flex; align-items:center; justify-content:space-between;
  }
  .hsu-tabs { display:flex; gap:6px; padding:10px; border-bottom:1px solid rgba(255,255,255,.08); position:sticky; top:0; background:#131313; z-index:1;}
  .hsu-tab { padding:8px 12px; border-radius:10px; font-weight:600; color:#bbb; cursor:pointer; }
  .hsu-tab.active { background:#1f1f1f; color:#ffd86a; border:1px solid rgba(255,216,106,.25); }
  .hsu-body { padding:16px 18px 24px; font-size:14px; }
  .hsu-grid { display:grid; gap:14px; grid-template-columns: repeat(12, 1fr); }
  .hsu-col-6 { grid-column: span 6; }
  .hsu-col-12 { grid-column: span 12; }
  .hsu-section { background:#0e0e0e; border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:14px; }
  .hsu-section h3 { margin:0 0 4px; font-size:15px; color:#ffd86a }
  .hsu-field { display:flex; gap:10px; align-items:center; margin:8px 0; }
  .hsu-field input[type="text"]{ flex:1; background:#141414; border:1px solid rgba(255,255,255,.12); color:#eee; border-radius:10px; padding:8px 10px; }
  .hsu-field .hsu-btn { background:#ffd86a; color:#1d1a15 }
  .hsu-muted { color:#a0a0a0; font-size:12px }

  /* — Motywy — */
  body.hsu-theme-classic .hsu-floating-toggle { background:#2a241a; color:#ffd86a; border-color: rgba(255,216,106,.25); }
  body.hsu-theme-remaster { --remaster-grad: linear-gradient(135deg, #fdf3cf, #f7d784 60%, #eab54f); }
  body.hsu-theme-remaster .hsu-card { background: #0f0f0f; }
  body.hsu-theme-remaster .hsu-tab.active { background:#181818; color:#ffe08a; border-color: rgba(255,224,138,.35); }
  body.hsu-theme-remaster .hsu-btn.primary { background: #ffe08a; color:#1a1a1a; }

  body.hsu-theme-pirate .hsu-floating-toggle { background:#0c1411; color:#7fffd4; border-color: rgba(127,255,212,.22); }
  body.hsu-theme-pirate .hsu-card { background:#0b0f0e; color:#d1fff4; }
  body.hsu-theme-pirate .hsu-tab.active { background:#0f1714; color:#7fffd4; border-color: rgba(127,255,212,.26); }
  body.hsu-theme-pirate .hsu-section h3 { color:#7fffd4; }

  body.hsu-theme-dark .hsu-floating-toggle { background:#111; color:#e2e2e2; border-color: rgba(255,255,255,.15); }
  body.hsu-theme-dark .hsu-card { background:#0f0f0f; color:#eee; }
  body.hsu-theme-dark .hsu-tab.active { background:#191919; color:#e7e7e7; border-color: rgba(255,255,255,.15); }
  `;

  if (typeof GM_addStyle === 'function') GM_addStyle(THEME_CSS);
  else {
    const s = document.createElement('style'); s.textContent = THEME_CSS; document.head.appendChild(s);
  }

  applyTheme(CONFIG.THEME);
  function applyTheme(themeName){
    Object.values(THEME_CLASS).forEach(cls => document.body.classList.remove(cls));
    const cls = THEME_CLASS[themeName] || THEME_CLASS.classic;
    document.body.classList.add(cls);
    CONFIG.THEME = themeName; saveConfig();
  }

  /** =========================
   *  UI: FAB + Modal
   *  ========================= */
  const fab = document.createElement('button');
  fab.className = 'hsu-floating-toggle';
  fab.innerHTML = `☀️ HeliosSuite`;
  document.body.appendChild(fab);

  const modal = document.createElement('div');
  modal.className = 'hsu-modal';
  modal.innerHTML = `
    <div class="hsu-card">
      <header>
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-weight:800; font-size:16px; letter-spacing:.2px">HeliosSuite</span>
          <span class="hsu-badge" style="background:#27231a; color:#ffd86a; border:1px solid rgba(255,216,106,.25)">by KID6767</span>
        </div>
        <button class="hsu-btn" id="hsuCloseBtn">✖</button>
      </header>
      <div class="hsu-tabs">
        <div class="hsu-tab active" data-tab="dash">Dashboard</div>
        <div class="hsu-tab" data-tab="hpulse">HeliosPulse</div>
        <div class="hsu-tab" data-tab="themes">Motywy</div>
        <div class="hsu-tab" data-tab="settings">Ustawienia</div>
      </div>
      <div class="hsu-body">
        <div class="hsu-tabpanel" data-panel="dash"></div>
        <div class="hsu-tabpanel" data-panel="hpulse" style="display:none"></div>
        <div class="hsu-tabpanel" data-panel="themes" style="display:none"></div>
        <div class="hsu-tabpanel" data-panel="settings" style="display:none"></div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  on(fab,'click', ()=> modal.classList.add('open'));
  on($('#hsuCloseBtn', modal),'click', ()=> modal.classList.remove('open'));
  $all('.hsu-tab', modal).forEach(tab=>{
    on(tab,'click', ()=>{
      $all('.hsu-tab', modal).forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.getAttribute('data-tab');
      $all('.hsu-tabpanel', modal).forEach(p=> p.style.display = (p.getAttribute('data-panel')===which ? '' : 'none'));
      renderPanel(which);
    });
  });

  /** =========================
   *  Panels render
   *  ========================= */
  function renderPanel(which){
    if (which==='dash') renderDash();
    else if (which==='hpulse') renderHPulse();
    else if (which==='themes') renderThemes();
    else if (which==='settings') renderSettings();
  }
  renderPanel('dash');

  /** Dashboard */
  function renderDash(){
    const el = $('.hsu-tabpanel[data-panel="dash"]', modal);
    el.innerHTML = `
      <div class="hsu-grid">
        <div class="hsu-col-6">
          <div class="hsu-section">
            <h3>👤 Gracz</h3>
            <div class="hsu-field"><div class="hsu-chip" style="background:#1f1f1f; color:#ffd86a; border:1px solid rgba(255,216,106,.25)">Nick</div> <b>${PLAYER_NICK}</b></div>
            <div class="hsu-muted">Wykryty automatycznie; możesz zmienić z poziomu ustawień, jeśli potrzeba.</div>
          </div>
        </div>
        <div class="hsu-col-6">
          <div class="hsu-section">
            <h3>☀️ HeliosPulse</h3>
            <div class="hsu-field">Status WebApp: <span id="hsuHpulseStatus" class="hsu-badge" style="background:#262626; color:#bbb">nie sprawdzono</span></div>
            <button class="hsu-btn" id="hsuPingPresence">✅ Zaznacz obecność</button>
            <button class="hsu-btn" id="hsuGenReport">🧾 Generuj raport dzienny (BBCode)</button>
            <div class="hsu-field"><a id="hsuReportLink" target="_blank" style="color:#ffd86a; text-decoration:none">🔗 Link do pełnego raportu (otwórz)</a></div>
          </div>
        </div>
        <div class="hsu-col-12">
          <div class="hsu-section">
            <h3>🎛️ Szybkie przełączniki</h3>
            <div class="hsu-field">
              <label><input type="checkbox" id="hsuToggleDelta"> Pokaż Δ statystyk</label>
              <label style="margin-left:14px"><input type="checkbox" id="hsuToggleTotals"> Pokaż sumy sojuszu</label>
              <label style="margin-left:14px"><input type="checkbox" id="hsuTogglePresence"> Pokaż obecnych dzisiaj</label>
            </div>
            <div class="hsu-muted">Dane szczegółowe zaciągane z Twojego arkusza przez Google Apps Script (HeliosPulse_Code.gs).</div>
          </div>
        </div>
      </div>
    `;
    // Bind quick toggles
    $('#hsuToggleDelta').checked = !!CONFIG.modules.showStatsDelta;
    $('#hsuToggleTotals').checked = !!CONFIG.modules.showAllianceTotals;
    $('#hsuTogglePresence').checked = !!CONFIG.modules.showPresenceToday;
    on($('#hsuToggleDelta'),'change', e=>{ CONFIG.modules.showStatsDelta = e.target.checked; saveConfig(); });
    on($('#hsuToggleTotals'),'change', e=>{ CONFIG.modules.showAllianceTotals = e.target.checked; saveConfig(); });
    on($('#hsuTogglePresence'),'change', e=>{ CONFIG.modules.showPresenceToday = e.target.checked; saveConfig(); });

    // Setup HeliosPulse buttons
    const statusEl = $('#hsuHpulseStatus');
    const reportLink = $('#hsuReportLink');
    const base = CONFIG.WEBAPP_URL || '';
    if (base) {
      statusEl.textContent = 'skonfigurowano';
      statusEl.style.background = '#16331a';
      statusEl.style.color = '#7effa1';
      reportLink.href = base + `?action=daily_report_bbcode&token=${encodeURIComponent(CONFIG.TOKEN)}`;
    } else {
      statusEl.textContent = 'brak WEBAPP_URL';
      statusEl.style.background = '#361a1a';
      statusEl.style.color = '#ff9a9a';
      reportLink.removeAttribute('href');
    }
    on($('#hsuPingPresence'), 'click', doPresencePing);
    on($('#hsuGenReport'), 'click', doGenerateReport);
  }

  /** HeliosPulse panel */
  function renderHPulse(){
    const el = $('.hsu-tabpanel[data-panel="hpulse"]', modal);
    el.innerHTML = `
      <div class="hsu-grid">
        <div class="hsu-col-12">
          <div class="hsu-section">
            <h3>⚙️ Konfiguracja HeliosPulse</h3>
            <div class="hsu-field"><div style="min-width:120px">WEBAPP_URL</div><input id="hsuWebapp" type="text" placeholder="https://script.google.com/.../exec" value="${CONFIG.WEBAPP_URL || ''}"></div>
            <div class="hsu-field"><div style="min-width:120px">TOKEN</div><input id="hsuToken" type="text" placeholder="HeliosPulseToken" value="${CONFIG.TOKEN || ''}"></div>
            <div class="hsu-field"><div style="min-width:120px">Sojusz</div><input id="hsuAlliance" type="text" value="${CONFIG.ALLIANCE || ''}"></div>
            <div class="hsu-field">
              <button class="hsu-btn" id="hsuSaveCfg">💾 Zapisz</button>
              <button class="hsu-btn" id="hsuTestPing">🧪 Test presence</button>
              <span id="hsuSaveMsg" class="hsu-muted"></span>
            </div>
          </div>
        </div>
        <div class="hsu-col-6">
          <div class="hsu-section">
            <h3>✅ Obecność</h3>
            <div class="hsu-field"><button class="hsu-btn" id="hsuPresenceBtn">Zaznacz obecność teraz</button><span id="hsuPresenceMsg" class="hsu-muted"></span></div>
            <div class="hsu-muted">Akcja GET: <code>?action=presence&token=...&nick=...</code></div>
          </div>
        </div>
        <div class="hsu-col-6">
          <div class="hsu-section">
            <h3>🧾 Raport dzienny</h3>
            <div class="hsu-field">
              <button class="hsu-btn" id="hsuGenBtn">Generuj BBCode</button>
              <a class="hsu-btn" id="hsuOpenBB" target="_blank">Otwórz BBCode</a>
            </div>
            <div class="hsu-muted">Akcja GET: <code>?action=daily_report_bbcode&token=...</code></div>
          </div>
        </div>
      </div>
    `;
    on($('#hsuSaveCfg'), 'click', ()=>{
      CONFIG.WEBAPP_URL = $('#hsuWebapp').value.trim();
      CONFIG.TOKEN = $('#hsuToken').value.trim() || 'HeliosPulseToken';
      CONFIG.ALLIANCE = $('#hsuAlliance').value.trim() || 'Legioniści Heliosa';
      saveConfig();
      $('#hsuSaveMsg').textContent = 'Zapisano ✔';
      setTimeout(()=> $('#hsuSaveMsg').textContent='', 1500);
      const open = $('#hsuOpenBB');
      if (CONFIG.WEBAPP_URL) open.href = CONFIG.WEBAPP_URL + `?action=daily_report_bbcode&token=${encodeURIComponent(CONFIG.TOKEN)}`;
    });
    on($('#hsuTestPing'),'click', doPresencePing);
    on($('#hsuPresenceBtn'),'click', doPresencePing);
    on($('#hsuGenBtn'),'click', doGenerateReport);
    const open = $('#hsuOpenBB');
    if (CONFIG.WEBAPP_URL) open.href = CONFIG.WEBAPP_URL + `?action=daily_report_bbcode&token=${encodeURIComponent(CONFIG.TOKEN)}`;
  }

  /** Motywy panel */
  function renderThemes(){
    const el = $('.hsu-tabpanel[data-panel="themes"]', modal);
    el.innerHTML = `
      <div class="hsu-grid">
        <div class="hsu-col-12">
          <div class="hsu-section">
            <h3>🎨 Motywy Aegis</h3>
            <div class="hsu-field" style="flex-wrap:wrap; gap:10px">
              ${['classic','remaster','pirate','dark'].map(t=>`
                <button class="hsu-btn ${CONFIG.THEME===t?'primary':''}" data-theme="${t}">
                  ${t==='classic'?'🏛️ Classic': t==='remaster'?'✨ Remaster': t==='pirate'?'☠️ Pirate':'🌙 Dark'}
                </button>`).join('')}
            </div>
            <div class="hsu-muted">Przełączanie działa globalnie. Styl dotyczy panelu i łatwego przestylowania elementów gry.</div>
          </div>
        </div>
      </div>
    `;
    $all('[data-theme]', el).forEach(btn=>{
      on(btn,'click', ()=>{
        applyTheme(btn.getAttribute('data-theme'));
        renderThemes();
      });
    });
  }

  /** Ustawienia panel (GF-style toggles) */
  function renderSettings(){
    const el = $('.hsu-tabpanel[data-panel="settings"]', modal);
    el.innerHTML = `
      <div class="hsu-grid">
        <div class="hsu-col-12">
          <div class="hsu-section">
            <h3>🔧 Ustawienia modułów</h3>
            <label style="display:block;margin:6px 0"><input type="checkbox" id="mDelta"> Pokazuj listę Δ statystyk (top 20)</label>
            <label style="display:block;margin:6px 0"><input type="checkbox" id="mTotals"> Pokazuj sumy sojuszu</label>
            <label style="display:block;margin:6px 0"><input type="checkbox" id="mPresence"> Pokazuj listę obecnych dzisiaj</label>
            <div style="margin-top:10px">
              <button class="hsu-btn" id="saveMods">Zapisz</button>
            </div>
          </div>
        </div>
      </div>
    `;
    $('#mDelta').checked = !!CONFIG.modules.showStatsDelta;
    $('#mTotals').checked = !!CONFIG.modules.showAllianceTotals;
    $('#mPresence').checked = !!CONFIG.modules.showPresenceToday;
    on($('#saveMods'),'click', ()=>{
      CONFIG.modules.showStatsDelta = $('#mDelta').checked;
      CONFIG.modules.showAllianceTotals = $('#mTotals').checked;
      CONFIG.modules.showPresenceToday = $('#mPresence').checked;
      saveConfig();
    });
  }

  /** =========================
   *  HeliosPulse actions
   *  ========================= */
  function doPresencePing(){
    const msgEl = $('#hsuPresenceMsg') || $('#hsuSaveMsg');
    const base = CONFIG.WEBAPP_URL?.trim();
    if (!base){ alert('Brak WEBAPP_URL w HeliosPulse. Uzupełnij w zakładce HeliosPulse.'); return; }
    const url = `${base}?action=presence&token=${encodeURIComponent(CONFIG.TOKEN)}&nick=${encodeURIComponent(PLAYER_NICK)}`;
    fetch(url, { method:'GET', credentials:'omit' })
      .then(r=>r.text())
      .then(t=>{
        log('presence ->', t);
        if (msgEl){ msgEl.textContent = 'Obecność ✔'; setTimeout(()=> msgEl.textContent='', 1500); }
        toast('Obecność zapisana');
      })
      .catch(err=>{
        console.error(err);
        alert('Presence: błąd połączenia. Sprawdź WEBAPP_URL / token.');
      });
  }

  function doGenerateReport(){
    const base = CONFIG.WEBAPP_URL?.trim();
    if (!base){ alert('Brak WEBAPP_URL w HeliosPulse. Uzupełnij w zakładce HeliosPulse.'); return; }
    const url = `${base}?action=daily_report_bbcode&token=${encodeURIComponent(CONFIG.TOKEN)}`;
    window.open(url, '_blank');
    toast('Wygenerowano raport dzienny (otworzono BBCode).');
  }

  /** =========================
   *  Little toast
   *  ========================= */
  const toastEl = document.createElement('div');
  toastEl.style.cssText = `
    position: fixed; bottom: 28px; right: 28px; z-index: 999999;
    background: #111; color:#ffd86a; border:1px solid rgba(255,216,106,.3);
    padding:10px 14px; border-radius:12px; box-shadow: ${'0 10px 30px rgba(0,0,0,.3)'};
    font: 600 13px var(--hsu-font); display:none;
  `;
  document.body.appendChild(toastEl);
  let toastTimer=null;
  function toast(txt){
    toastEl.textContent = '☀️ ' + txt;
    toastEl.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toastEl.style.display='none', 1600);
  }

  /** =========================
   *  Left menu icon (shortcut)
   *  ========================= */
  function injectLeftShortcut(){
    // delikatnie: nie znamy 100% selektorów; wstawiamy własny przy lewym docku
    const holder = document.createElement('div');
    holder.style.cssText = 'position:fixed; left:12px; top:92px; z-index:999997;';
    holder.innerHTML = `
      <button title="HeliosSuite" class="hsu-btn" style="background:#2a241a; color:#ffd86a; border:1px solid rgba(255,216,106,.25)">
        ☀️ Helios
      </button>
    `;
    on(holder.firstElementChild, 'click', ()=> modal.classList.add('open'));
    document.body.appendChild(holder);
  }
  injectLeftShortcut();

})();
