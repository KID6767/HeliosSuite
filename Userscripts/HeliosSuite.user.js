// ==UserScript==
// @name         HeliosSuite (TEMP MONO) — Motywy • Panel • Raporty
// @namespace    https://kidz667.github.io/HeliosSuite/
// @version      0.9.0
// @description  Kompletny panel ustawień w stylu DIO/GRCT + menedżer motywów + integracje. Zapis w localStorage, eksport/import, skróty.
// @author       Helios Team
// @match        https://*.grepolis.com/game/*
// @grant        GM_addStyle
// ==/UserScript==

(() => {
  'use strict';

  /* =========================
     KONFIG BACKENDU (stałe)
     ========================= */
  const CONFIG = {
    WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbz_uCloWbGeurR9K29hhuvYglv9A9f-je7vcrA1LmV4ZfcUBfaxC9gujIZe15AhgFNYQg/exec',
    TOKEN: 'HeliosPulseToken',
    STORAGE_PREFIX: 'HS_',
    UI: {
      titleMotywy: 'Motywy',
      titlePanel: 'Panel',
      titleRaporty: 'Raporty',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMSIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0xMiA0TDE0LjMgOS4zTjIwIDlMMTUuNiAxMi43TDE3IDE5TDEyIDE1LjZMMTAgMTlMOC40IDEyLjdsLTQuNC0zTDEyIDRaIiBmaWxsPSIjMTQxN0I0Ii8+PC9zdmc+'
    }
  };

  /* =========================
     POMOCNICZE — storage, dom
     ========================= */
  const S = {
    key: k => CONFIG.STORAGE_PREFIX + k,
    get(k, def) {
      try {
        const v = localStorage.getItem(this.key(k));
        return v ? JSON.parse(v) : def;
      } catch {
        return def;
      }
    },
    set(k, v) {
      localStorage.setItem(this.key(k), JSON.stringify(v));
    },
    del(k) {
      localStorage.removeItem(this.key(k));
    }
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* =========================
     DOMYŚLNE USTAWIENIA
     ========================= */
  const DEFAULTS = {
    motyw: 'remaster',        // classic | remaster | pirate | dark
    tryb: 'auto',             // auto | day | night
    mod_panel: true,          // włączony przycisk docka
    mod_ping: true,           // przycisk „zapisz obecność”
    mod_raport: true,         // przycisk „raport dzienny”
    klawisze: {
      openPanel: 'KeyG',      // G
      ping: 'KeyO',           // O
      report: 'KeyR'          // R
    },
    ui_scale: 1.0             // skala UI (opcjonalnie)
  };

  function getSettings() {
    return { ...DEFAULTS, ...S.get('settings', {}) };
  }
  function saveSettings(patch) {
    const next = { ...getSettings(), ...patch };
    S.set('settings', next);
    applyTheme(next);
    buildOrUpdateDock(next);
    return next;
  }

  /* =========================
     THEME MANAGER (CSS klasy)
     ========================= */
  function ensureRootClasses() {
    const root = document.documentElement;
    if (!root.classList.contains('hs-ready')) {
      root.classList.add('hs-ready');
    }
  }

  function applyTheme(settings = getSettings()) {
    ensureRootClasses();
    const root = document.documentElement;
    ['hs-classic','hs-remaster','hs-pirate','hs-dark','hs-day','hs-night'].forEach(c => root.classList.remove(c));

    // motyw
    const map = {
      classic: 'hs-classic',
      remaster: 'hs-remaster',
      pirate: 'hs-pirate',
      dark: 'hs-dark'
    };
    root.classList.add(map[settings.motyw] || 'hs-remaster');

    // tryb dnia/nocy
    let mode = settings.tryb;
    if (mode === 'auto') {
      const h = new Date().getHours();
      mode = (h >= 7 && h < 20) ? 'day' : 'night';
    }
    root.classList.add(mode === 'night' ? 'hs-night' : 'hs-day');
  }

  /* =========================
     STYLE GLOBALNE (okna, tła)
     ========================= */
  GM_addStyle(`
    /* Skórki — kolory i tła */
    :root.hs-remaster { --hs-bg: #0f1a22; --hs-panel: #17232d; --hs-accent:#13b0ff; --hs-text:#e6eef4; --hs-soft:#9ab3c3; }
    :root.hs-classic  { --hs-bg: #112; --hs-panel:#1a2330; --hs-accent:#f0b90b; --hs-text:#f2f2f2; --hs-soft:#b6c2ce; }
    :root.hs-pirate   { --hs-bg: #0e0c0a; --hs-panel:#16120e; --hs-accent:#f59e0b; --hs-text:#e9d8a6; --hs-soft:#c9b37a; }
    :root.hs-dark     { --hs-bg: #0d0f14; --hs-panel:#12161f; --hs-accent:#7c3aed; --hs-text:#e5e7eb; --hs-soft:#a3aab3; }

    :root.hs-day  { --hs-bg-overlay: rgba(10,16,22,.92); }
    :root.hs-night{ --hs-bg-overlay: rgba(6,9,13,.96); }

    /* Naprawa okien Grepolis + ciemny pergamin */
    .gpwindow, .ui-dialog, .gp_overlay, .gpreport_content, .ui-dialog .ui-dialog-content {
      background: var(--hs-panel)!important;
      color: var(--hs-text)!important;
    }
    .gpwindow .gpcontent, .ui-dialog .ui-dialog-content {
      background: var(--hs-bg-overlay)!important;
    }
    .game_header, .game_footer { z-index: 10!important; }
    .ui-dialog { z-index: 4200!important; }
    .ui-dialog .ui-dialog-titlebar { background: linear-gradient(#1c2a36,#15212b)!important; color: var(--hs-text)!important; }

    /* Przycisk aktywny/checkboxy */
    .hs-btn {
      display:inline-flex; align-items:center; gap:.5rem;
      padding:.45rem .75rem; border:1px solid rgba(255,255,255,.08);
      background: #0e1620; color: var(--hs-text); border-radius:6px; cursor:pointer;
    }
    .hs-btn.primary { background: var(--hs-accent); color:#05070b; border-color: transparent; font-weight:600; }
    .hs-row { display:flex; gap:1rem; align-items:center; margin:.5rem 0; }
    .hs-col { display:flex; flex-direction:column; gap:.25rem; }
    .hs-label { font-size:.95rem; color:var(--hs-soft); }
    .hs-input, .hs-select, .hs-textarea {
      background:#0c141d; color:var(--hs-text); border:1px solid rgba(255,255,255,.08); border-radius:6px;
      padding:.45rem .6rem;
    }
    .hs-select { padding:.45rem .45rem; }
    .hs-textarea{ min-height:120px; }

    /* Dock na dole (panel skrótów) */
    #hs-dock {
      position:fixed; left:18px; bottom:18px; z-index:4201;
      display:flex; gap:8px; flex-direction:column;
    }
    #hs-dock .card {
      background: var(--hs-panel); border:1px solid rgba(255,255,255,.06); color:var(--hs-text);
      border-radius:10px; padding:10px 12px; min-width:280px; box-shadow:0 10px 22px rgba(0,0,0,.4);
    }
    #hs-dock .card h4 { margin:.25rem 0 .5rem; color:var(--hs-soft); font-weight:600; }
    #hs-dock .meta{ display:flex; justify-content:space-between; color:var(--hs-soft); font-size:.86rem; }

    /* Modal „ustawienia dodatków” */
    .hs-modal {
      position:fixed; inset:0; z-index:4202; display:none; align-items:center; justify-content:center;
      background: rgba(6,10,16,.65);
    }
    .hs-modal.open { display:flex; }
    .hs-window {
      width: 760px; max-width:calc(100vw - 48px); max-height:calc(100vh - 48px); overflow:auto;
      background: var(--hs-panel); border:1px solid rgba(255,255,255,.08); border-radius:12px; box-shadow:0 16px 32px rgba(0,0,0,.5);
    }
    .hs-head {
      display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid rgba(255,255,255,.08);
      background: linear-gradient(180deg, rgba(255,255,255,.04), transparent);
    }
    .hs-head .title { display:flex; align-items:center; gap:10px; font-weight:700; }
    .hs-head img { width:20px; height:20px; border-radius:50%; }
    .hs-tabs { display:flex; padding:0 10px; gap:6px; border-bottom:1px solid rgba(255,255,255,.06); }
    .hs-tab { padding:10px 12px; cursor:pointer; color:var(--hs-soft); border-radius:8px 8px 0 0; }
    .hs-tab.active { color:var(--hs-text); background:#0f1a24; border:1px solid rgba(255,255,255,.06); border-bottom:0; }
    .hs-body { padding:14px 16px 18px; }
    .hs-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .hs-section { background:#0c141d; border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:12px; }
    .hs-section h5 { margin:0 0 8px; font-size:1rem; color:var(--hs-text); }
  `);

  /* =========================
     UI – Modal bazowy
     ========================= */
  function modal(title) {
    const wrap = document.createElement('div');
    wrap.className = 'hs-modal';
    wrap.innerHTML = `
      <div class="hs-window">
        <div class="hs-head">
          <div class="title"><img src="${CONFIG.UI.logo}" alt=""><span>${title}</span></div>
          <div style="display:flex; gap:8px">
            <button class="hs-btn" data-act="export">Eksport</button>
            <button class="hs-btn" data-act="import">Import</button>
            <button class="hs-btn" data-act="reset">Reset</button>
            <button class="hs-btn" data-act="close">Zamknij</button>
          </div>
        </div>
        <div class="hs-tabs"></div>
        <div class="hs-body"></div>
      </div>
    `;
    document.body.appendChild(wrap);

    wrap.addEventListener('click', (e) => {
      const t = e.target;
      if (t.dataset?.act === 'close' || e.target === wrap) wrap.classList.remove('open');
      if (t.dataset?.act === 'export') doExport();
      if (t.dataset?.act === 'import') doImport();
      if (t.dataset?.act === 'reset')  { localStorage.clear(); location.reload(); }
    });

    function open()  { wrap.classList.add('open'); }
    function close() { wrap.classList.remove('open'); }
    function setTabs(items) {
      const tabsEl = $('.hs-tabs', wrap);
      tabsEl.innerHTML = '';
      items.forEach((it, idx) => {
        const b = document.createElement('div');
        b.className = 'hs-tab' + (idx===0 ? ' active':'');
        b.textContent = it.label;
        b.dataset.key = it.key;
        b.addEventListener('click', () => {
          $$('.hs-tab', tabsEl).forEach(tb=>tb.classList.remove('active'));
          b.classList.add('active');
          const body = $('.hs-body', wrap);
          body.innerHTML = '';
          body.appendChild(it.render());
        });
        tabsEl.appendChild(b);
      });
      // open first
      tabsEl.querySelector('.hs-tab')?.click();
    }

    return { el: wrap, open, close, setTabs };
  }

  function doExport() {
    const data = {
      version: '0.9.0',
      settings: getSettings()
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert('Skopiowano ustawienia do schowka.');
  }
  function doImport() {
    const json = prompt('Wklej JSON ustawień:');
    if (!json) return;
    try {
      const data = JSON.parse(json);
      if (data?.settings) {
        S.set('settings', data.settings);
        location.reload();
      } else {
        alert('Niepoprawny JSON.');
      }
    } catch {
      alert('Nie udało się wczytać JSON-a.');
    }
  }

  /* =========================
     PANELE: MOTYWY • PANEL • RAPORTY
     ========================= */

  // 1) MOTYWY
  function openMotywy() {
    const m = modal(CONFIG.UI.titleMotywy);
    m.setTabs([
      { key: 'look', label: 'Wygląd', render: renderMotywyLook },
      { key: 'zaaw', label: 'Zaawansowane', render: renderMotywyAdv },
      { key: 'info', label: 'O motywach', render: renderMotywyInfo }
    ]);
    m.open();
  }
  function renderMotywyLook() {
    const s = getSettings();
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="hs-grid">
        <div class="hs-section">
          <h5>Wybór motywu</h5>
          <div class="hs-row">
            <label class="hs-col"><span class="hs-label">Motyw</span>
              <select class="hs-select" data-k="motyw">
                <option value="classic">Classic</option>
                <option value="remaster">Remaster</option>
                <option value="pirate">Piracki</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label class="hs-col"><span class="hs-label">Tryb</span>
              <select class="hs-select" data-k="tryb">
                <option value="auto">Auto (dzień/noc)</option>
                <option value="day">Dzienny</option>
                <option value="night">Nocny</option>
              </select>
            </label>
          </div>
          <div class="hs-row">
            <button class="hs-btn primary" data-save> Zapisz </button>
          </div>
        </div>
        <div class="hs-section">
          <h5>Podgląd</h5>
          <div class="hs-col">
            <span class="hs-label">Podgląd jest natychmiastowy po „Zapisz”.</span>
            <span class="hs-label">Protip: klawisz G otwiera panel skrótów na dole.</span>
          </div>
        </div>
      </div>
    `;
    $('[data-k="motyw"]', root).value = s.motyw;
    $('[data-k="tryb"]', root).value = s.tryb;
    $('[data-save]', root).addEventListener('click', () => {
      const motyw = $('[data-k="motyw"]', root).value;
      const tryb = $('[data-k="tryb"]', root).value;
      saveSettings({ motyw, tryb });
      alert('Zapisano motyw.');
    });
    return root;
  }
  function renderMotywyAdv() {
    const s = getSettings();
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="hs-grid">
        <div class="hs-section">
          <h5>Skalowanie UI</h5>
          <div class="hs-row">
            <label class="hs-col"><span class="hs-label">Skala (0.9 – 1.2)</span>
              <input class="hs-input" type="number" step="0.01" min="0.9" max="1.2" data-k="ui_scale">
            </label>
          </div>
          <div class="hs-row"><button class="hs-btn primary" data-save> Zapisz </button></div>
        </div>
        <div class="hs-section">
          <h5>Reset motywów</h5>
          <div class="hs-row"><button class="hs-btn" data-reset>Przywróć domyślne</button></div>
        </div>
      </div>
    `;
    $('[data-k="ui_scale"]', root).value = s.ui_scale;
    $('[data-save]', root).addEventListener('click', () => {
      const ui_scale = parseFloat($('[data-k="ui_scale"]', root).value || '1.0');
      document.documentElement.style.setProperty('zoom', ui_scale.toString());
      saveSettings({ ui_scale });
      alert('Zapisano skalę UI.');
    });
    $('[data-reset]', root).addEventListener('click', () => {
      S.del('settings');
      location.reload();
    });
    return root;
  }
  function renderMotywyInfo() {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="hs-section">
        <h5>Informacje</h5>
        <p>Motoryka motywów: własne zmienne CSS + klasy na <code>&lt;html&gt;</code>. 
        Tła okien i pergaminów są przechwycone i skórkowane tak, by nie przeciekały beżowe tekstury.</p>
      </div>
    `;
    return root;
  }

  // 2) PANEL (moduły + skróty)
  function openPanel() {
    const m = modal(CONFIG.UI.titlePanel);
    m.setTabs([
      { key: 'mods', label: 'Moduły', render: renderPanelMods },
      { key: 'keys', label: 'Skróty', render: renderPanelKeys },
      { key: 'about', label: 'O panelu', render: renderPanelAbout }
    ]);
    m.open();
  }
  function renderPanelMods() {
    const s = getSettings();
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="hs-grid">
        <div class="hs-section">
          <h5>Moduły</h5>
          <label class="hs-row">
            <input type="checkbox" data-k="mod_panel"> <span>Panel skrótów (dock)</span>
          </label>
          <label class="hs-row">
            <input type="checkbox" data-k="mod_ping"> <span>Przycisk „Zapisz obecność”</span>
          </label>
          <label class="hs-row">
            <input type="checkbox" data-k="mod_raport"> <span>Przycisk „Raport dzienny”</span>
          </label>
          <div class="hs-row"><button class="hs-btn primary" data-save>Zapisz</button></div>
        </div>
        <div class="hs-section">
          <h5>Stan</h5>
          <div class="hs-col">
            <span class="hs-label">Włącz/wyłącz moduły i sprawdź na docku (lewy-dolny róg).</span>
            <span class="hs-label">Zmiany są natychmiastowe po „Zapisz”.</span>
          </div>
        </div>
      </div>
    `;
    $$('input[type="checkbox"]', root).forEach(cb => {
      cb.checked = !!s[cb.dataset.k];
    });
    $('[data-save]', root).addEventListener('click', () => {
      const mod_panel  = $('[data-k="mod_panel"]', root).checked;
      const mod_ping   = $('[data-k="mod_ping"]', root).checked;
      const mod_raport = $('[data-k="mod_raport"]', root).checked;
      saveSettings({ mod_panel, mod_ping, mod_raport });
      alert('Zapisano moduły.');
    });
    return root;
  }
  function renderPanelKeys() {
    const s = getSettings();
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="hs-grid">
        <div class="hs-section">
          <h5>Skróty</h5>
          <div class="hs-col">
            <label class="hs-row"><span class="hs-label" style="width:200px">Otwórz dock</span>
              <input class="hs-input" data-k="openPanel" placeholder="KeyG">
            </label>
            <label class="hs-row"><span class="hs-label" style="width:200px">Ping obecności</span>
              <input class="hs-input" data-k="ping" placeholder="KeyO">
            </label>
            <label class="hs-row"><span class="hs-label" style="width:200px">Raport dzienny</span>
              <input class="hs-input" data-k="report" placeholder="KeyR">
            </label>
            <div class="hs-row"><button class="hs-btn primary" data-save>Zapisz</button></div>
          </div>
        </div>
        <div class="hs-section">
          <h5>Info</h5>
          <p>Wartości muszą być kodami KeyboardEvent (np. <code>KeyG</code>, <code>KeyR</code>). Możesz sprawdzić na <a target="_blank" href="https://keycode.info/">keycode.info</a>.</p>
        </div>
      </div>
    `;
    $('[data-k="openPanel"]', root).value = s.klawisze.openPanel;
    $('[data-k="ping"]', root).value = s.klawisze.ping;
    $('[data-k="report"]', root).value = s.klawisze.report;
    $('[data-save]', root).addEventListener('click', () => {
      const klawisze = {
        openPanel: $('[data-k="openPanel"]', root).value || 'KeyG',
        ping:      $('[data-k="ping"]', root).value || 'KeyO',
        report:    $('[data-k="report"]', root).value || 'KeyR'
      };
      saveSettings({ klawisze });
      alert('Zapisano skróty.');
    });
    return root;
  }
  function renderPanelAbout() {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="hs-section">
        <h5>O panelu</h5>
        <p>Ten panel scala i porządkuje nasze funkcje w jednym miejscu. 
           Style i okna są w pełni zintegrowane z UI gry, włącznie z nakładkami i tłem.</p>
      </div>
    `;
    return root;
  }

  // 3) RAPORTY / BACKEND
  function openRaporty() {
    const m = modal(CONFIG.UI.titleRaporty);
    m.setTabs([
      { key: 'ping',   label: 'Obecność', render: renderRaportPing },
      { key: 'daily',  label: 'Raport dzienny', render: renderRaportDaily },
      { key: 'status', label: 'Status', render: renderRaportStatus }
    ]);
    m.open();
  }
  function renderRaportPing() {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="hs-grid">
        <div class="hs-section">
          <h5>Ping obecności</h5>
          <div class="hs-row">
            <button class="hs-btn primary" data-ping>Wyślij ping</button>
          </div>
          <div class="hs-col"><span class="hs-label">Wysyła żądanie POST do WebApp GAS z tokenem.</span></div>
        </div>
        <div class="hs-section"><h5>Log</h5><pre class="hs-textarea" id="hs-log-ping"></pre></div>
      </div>
    `;
    $('[data-ping]', root).addEventListener('click', async() => {
      const log = $('#hs-log-ping', root);
      try {
        const res = await fetch(CONFIG.WEBAPP_URL, {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ token: CONFIG.TOKEN, action:'presence', time: new Date().toISOString() })
        });
        log.textContent = `Status: ${res.status}\n${await res.text()}`;
      } catch(e) {
        log.textContent = 'Błąd: ' + e.message;
      }
    });
    return root;
  }
  function renderRaportDaily() {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="hs-grid">
        <div class="hs-section">
          <h5>Raport dzienny</h5>
          <div class="hs-row">
            <button class="hs-btn primary" data-send>Generuj + wyślij</button>
          </div>
        </div>
        <div class="hs-section"><h5>Podgląd</h5><pre class="hs-textarea" id="hs-log-report"></pre></div>
      </div>
    `;
    $('[data-send]', root).addEventListener('click', async() => {
      const out = {
        world: (window.Game && Game.world_id) || 'unknown',
        player: (window.Game && Game.player_name) || 'unknown',
        ts: new Date().toISOString(),
        notes: 'Sample daily payload — wpięcie danych w kolejnych iteracjach.'
      };
      const log = $('#hs-log-report', root);
      try {
        const res = await fetch(CONFIG.WEBAPP_URL, {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ token: CONFIG.TOKEN, action:'daily_report_json', data: out })
        });
        log.textContent = `Status: ${res.status}\n${await res.text()}`;
      } catch(e) {
        log.textContent = 'Błąd: ' + e.message;
      }
    });
    return root;
  }
  function renderRaportStatus() {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="hs-section">
        <h5>Status połączenia</h5>
        <div class="hs-row">
          <button class="hs-btn" data-check>Sprawdź GET</button>
        </div>
        <pre class="hs-textarea" id="hs-log-status"></pre>
      </div>
    `;
    $('[data-check]', root).addEventListener('click', async() => {
      const log = $('#hs-log-status', root);
      try {
        const url = CONFIG.WEBAPP_URL + `?token=${encodeURIComponent(CONFIG.TOKEN)}&action=presence`;
        const res = await fetch(url, { method:'GET' });
        log.textContent = `Status: ${res.status}\n${await res.text()}`;
      } catch(e) {
        log.textContent = 'Błąd: ' + e.message;
      }
    });
    return root;
  }

  /* =========================
     DOCK (skrót w rogu)
     ========================= */
  function buildOrUpdateDock(settings = getSettings()) {
    let dock = document.getElementById('hs-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'hs-dock';
      document.body.appendChild(dock);
    }
    dock.innerHTML = '';

    if (settings.mod_panel) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h4>HeliosSuite</h4>
        <div class="hs-row">
          <button class="hs-btn" data-open="motywy">Motywy</button>
          <button class="hs-btn" data-open="panel">Panel</button>
          <button class="hs-btn" data-open="raporty">Raporty</button>
        </div>
        <div class="meta"><span>Świat: ${window.Game?.world_id || '-'}</span><span>${new Date().toLocaleString()}</span></div>
      `;
      card.addEventListener('click', (e) => {
        const v = e.target?.dataset?.open;
        if (v === 'motywy') openMotywy();
        if (v === 'panel')  openPanel();
        if (v === 'raporty')openRaporty();
      });
      dock.appendChild(card);
    }
    if (settings.mod_ping) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h4>Obecność</h4>
        <div class="hs-row"><button class="hs-btn primary" data-act="ping">Zapisz obecność</button></div>
      `;
      card.addEventListener('click', async(e) => {
        if (e.target?.dataset?.act === 'ping') {
          try { await fetch(CONFIG.WEBAPP_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token: CONFIG.TOKEN, action:'presence' }) }); alert('Ping wysłany.'); } catch { alert('Błąd wysyłki.'); }
        }
      });
      dock.appendChild(card);
    }
    if (settings.mod_raport) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h4>Raport</h4>
        <div class="hs-row"><button class="hs-btn" data-act="preview">Podgląd BBCode</button><button class="hs-btn primary" data-act="send">Wyślij JSON</button></div>
      `;
      card.addEventListener('click', async(e) => {
        if (e.target?.dataset?.act === 'preview') openRaporty();
        if (e.target?.dataset?.act === 'send') {
          try { await fetch(CONFIG.WEBAPP_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token: CONFIG.TOKEN, action:'daily_report_json', data:{ts:new Date().toISOString()} }) }); alert('Raport wysłany.'); } catch { alert('Błąd wysyłki.'); }
        }
      });
      dock.appendChild(card);
    }
  }

  /* =========================
     WPIĘCIE DO „Ustawienia → Inne”
     ========================= */
  function hookSettingsMenu() {
    // klik w koło zębate (w prawym panelu) otwiera okno ustawień gry; my czekamy aż DOM tego okna się pojawi
    const obs = new MutationObserver(() => {
      const list = $$('.settings-list a, .settings .list li a, #settings .content a'); // różne tematy/wersje
      const haveApps = list.some(el => el.textContent?.trim() === 'Aplikacje'); // „Inne” sekcja zwykle jest w tym drzewie
      // wpinamy tylko raz
      if ($('#hs-in-settings')) return;

      const container = document.querySelector('.settings .list, .settings-list, .settings_menu, .content .list');
      if (!container) return;

      const box = document.createElement('div');
      box.id = 'hs-in-settings';
      box.innerHTML = `
        <div style="margin:10px 0 0;border-top:1px solid rgba(255,255,255,.12); padding-top:8px">
          <a href="javascript:void(0)" class="hs-btn" data-open="motywy">${CONFIG.UI.titleMotywy}</a>
          <a href="javascript:void(0)" class="hs-btn" data-open="panel">${CONFIG.UI.titlePanel}</a>
          <a href="javascript:void(0)" class="hs-btn" data-open="raporty">${CONFIG.UI.titleRaporty}</a>
        </div>
      `;
      container.appendChild(box);

      box.addEventListener('click', (e) => {
        const v = e.target?.dataset?.open;
        if (v === 'motywy') openMotywy();
        if (v === 'panel')  openPanel();
        if (v === 'raporty')openRaporty();
      });
    });
    obs.observe(document.body, { childList:true, subtree:true });
  }

  /* =========================
     SKRÓTY KLAWIATUROWE
     ========================= */
  function bindHotkeys() {
    window.addEventListener('keydown', (e) => {
      const s = getSettings();
      if (e.code === s.klawisze.openPanel) {
        const dock = document.getElementById('hs-dock');
        if (dock) dock.style.display = (dock.style.display === 'none' ? '' : 'none');
      } else if (e.code === s.klawisze.ping) {
        if (s.mod_ping) fetch(CONFIG.WEBAPP_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token: CONFIG.TOKEN, action:'presence' }) });
      } else if (e.code === s.klawisze.report) {
        if (s.mod_raport) openRaporty();
      }
    });
  }

  /* =========================
     START
     ========================= */
  function init() {
    const s = getSettings();
    applyTheme(s);
    buildOrUpdateDock(s);
    hookSettingsMenu();
    bindHotkeys();
  }

  // inicjalizacja po załadowaniu gry/DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
