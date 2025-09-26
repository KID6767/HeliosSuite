// ==UserScript==
// @name         HeliosSuite (Aegis + HeliosPulse + Helpers)
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.0
// @description  Motywy Aegis, panel raportów HeliosPulse (UI), bezpieczne helpers (GrepoFusion core) – wszystko w jednym.
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @exclude      https://forum*.grepolis.*/*
// @exclude      http://forum*.grepolis.*/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(() => {
  'use strict';

  /******************************************************************
   * KONFIGURACJA (UZUPEŁNIJ 2 RZECZY, JEŚLI CHCESZ RAPORTY ONLINE)
   ******************************************************************/
  const CONFIG = {
    WEBAPP_URL: "https://script.google.com/macros/s/AKfycbzl-XWLBfFa-Zk9LpU5gsHm6udl7FcQktTast8piZCW/dev",            // <--- Wklej pełny URL do Google Apps Script (końcówka /exec). Np.: "https://script.google.com/macros/s/XXXXX/exec"
    TOKEN: "HeliosPulseToken", // <--- Ten sam, co w Twoim .gs (HP.TOKEN)
    ALLIANCE_NAME: "Legioniści Heliosa",
    AUTO_PING_EVERY_MIN: 15    // co ile minut ping obecności; 0 = wyłącz auto-ping
  };

  /******************************************************************
   * NARZĘDZIA
   ******************************************************************/
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const log = (...a) => console.log("[HeliosSuite]", ...a);

  const store = {
    get(k, d=null){ try { return JSON.parse(localStorage.getItem(k) ?? "null") ?? d; } catch { return d; } },
    set(k, v){ localStorage.setItem(k, JSON.stringify(v)); },
    del(k){ localStorage.removeItem(k); }
  };

  const nickGuess = () => {
    // spróbuj wyciągnąć nick gracza z UI gry (fallback do "Unknown")
    // Grepolis zwykle ma nick w elemencie .ui_various .player_name lub w nagłówkach
    const cands = [
      '.ui_various .player_name',
      '.game_header .player', 
      '#ui_box .player'
    ];
    for (const sel of cands) {
      const t = $(sel)?.textContent?.trim();
      if (t && t.length >= 2) return t;
    }
    // ewentualnie z title'a
    const t = document.title.replace(/\s*\|\s*Grepolis.*/i,'').trim();
    return t || "Unknown";
  };

  const worldGuess = () => {
    // próba odczytu nazwy świata z adresu / nagłówków
    const host = location.host; // np. plX.grepolis.com
    const m = host.match(/^([a-z]{2}\d+)\./i);
    return m ? m[1] : host;
  };

  async function callWebApp(action, params = {}) {
    if (!CONFIG.WEBAPP_URL) return { ok:false, error:"NO_URL" };
    const p = new URLSearchParams({ action, token: CONFIG.TOKEN, ...params });
    try {
      const res = await fetch(`${CONFIG.WEBAPP_URL}?${p.toString()}`, { method: 'GET', credentials: 'include' });
      const txt = await res.text();
      // backend zwraca "OK" / "presence ok" / JSON (czasem)
      if (txt.startsWith("{") || txt.startsWith("[")) {
        try { return JSON.parse(txt); } catch { return { ok:true, raw: txt }; }
      }
      return { ok:true, raw: txt };
    } catch (e) {
      return { ok:false, error:String(e) };
    }
  }

  /******************************************************************
   * MOTYWY (Aegis)
   ******************************************************************/
  const THEMES = {
    "classic": `
      :root{ --hs-bg:#1a1a1a; --hs-panel:#222; --hs-acc:#f0c66f; --hs-text:#eee; --hs-text-dim:#bbb; --hs-ok:#8fdf72; --hs-bad:#ff6b6b; }
      body, #ui_box, .game_inner, .gpwindow_content { background-color:#0e0e10 !important; color:var(--hs-text) !important; }
      .gpwindow, .gpwindow_content, .ui-dialog, .academy, .barracks, .docks, .senate, .page_content { background:#171717 !important; border:1px solid #2a2a2a !important; }
      a, .gpwindow .gpwindow_title { color:var(--hs-acc) !important; }
      .button, button, .btn { background:#252525 !important; border:1px solid #3a3a3a !important; color:#f5f5f5 !important; }
      .button:hover, button:hover { filter:brightness(1.1) }
    `,
    "remaster": `
      :root{ --hs-bg:#0d1117; --hs-panel:#161b22; --hs-acc:#f0c66f; --hs-text:#e6edf3; --hs-text-dim:#9aa8b5; --hs-ok:#22c55e; --hs-bad:#ef4444; }
      body, #ui_box, .game_inner, .gpwindow_content { background:linear-gradient(180deg, #0d1117 0%, #0b0f14 100%) !important; color:var(--hs-text)!important; }
      .gpwindow, .gpwindow_content, .ui-dialog, .page_content { background:#161b22 !important; border:1px solid #28303a !important; box-shadow:0 10px 20px rgba(0,0,0,.35) }
      .gpwindow .gpwindow_title { color: #f0c66f !important; letter-spacing:.5px }
      .button, button, .btn { background:#1f2630 !important; border:1px solid #2c3541 !important; color:#e6edf3 !important; border-radius:10px }
      .button:hover, button:hover { transform:translateY(-1px); transition:all .15s ease; }
    `,
    "pirate": `
      :root{ --hs-bg:#07130f; --hs-panel:#0c1e19; --hs-acc:#0bd39f; --hs-text:#e6fff6; --hs-text-dim:#a9d7c8; --hs-ok:#10b981; --hs-bad:#fb7185; }
      body, #ui_box, .game_inner, .gpwindow_content { background:radial-gradient(1200px 600px at 10% 0%, #0c1915 0%, #07130f 60%, #050e0b 100%) !important; color:var(--hs-text)!important; }
      .gpwindow, .gpwindow_content, .ui-dialog, .page_content { background:#0c1e19 !important; border:1px solid #134939 !important; box-shadow:0 10px 20px rgba(0,0,0,.4) }
      .gpwindow .gpwindow_title { color:#0bd39f !important }
      .button, button, .btn { background:#0e231d !important; border:1px solid #165846 !important; color:#e6fff6 !important; border-radius:10px }
    `,
    "dark": `
      :root{ --hs-bg:#0a0a0a; --hs-panel:#141414; --hs-acc:#d4af37; --hs-text:#f1f1f1; --hs-text-dim:#bdbdbd; --hs-ok:#27ae60; --hs-bad:#e74c3c; }
      body, #ui_box, .game_inner, .gpwindow_content { background:#0a0a0a !important; color:var(--hs-text)!important;}
      .gpwindow, .gpwindow_content, .ui-dialog, .page_content { background:#141414 !important; border:1px solid #242424 !important }
      .button, button, .btn { background:#1b1b1b !important; border:1px solid #2a2a2a !important; color:#f1f1f1 !important; }
    `
  };

  function applyTheme(name){
    const css = THEMES[name] || THEMES.remaster;
    GM_addStyle(css);
    store.set("HS_THEME", name);
  }

  /******************************************************************
   * PANEL / IKONA W LEWYM MENU
   ******************************************************************/
  function injectLeftIcon() {
    // spróbuj listy ikon po lewej
    const leftBar = $('#ui_box .advisor_border, #ui_box .advisors, #ui_box .ui-various, #ui_box');
    if (!leftBar || $('#heliosuite-icon')) return;

    const btn = document.createElement('div');
    btn.id = 'heliosuite-icon';
    btn.style.cssText = `
      position:fixed; left:8px; bottom:16px; z-index:99999;
      width:42px; height:42px; border-radius:12px; 
      background:var(--hs-panel,#161b22); border:1px solid rgba(255,255,255,.08);
      display:flex; align-items:center; justify-content:center; 
      box-shadow:0 8px 18px rgba(0,0,0,.35); cursor:pointer; 
    `;
    btn.title = 'HeliosSuite';
    btn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#f0c66f" aria-hidden="true">
        <path d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.31L12 14.77l-4.78 2.52.91-5.31-3.86-3.76 5.34-.78L12 2z"/>
      </svg>`;
    btn.addEventListener('click', togglePanel);
    document.body.appendChild(btn);
  }

  let panelVisible = false;
  function togglePanel(){
    if (panelVisible) { $('#heliosuite-panel')?.remove(); panelVisible=false; return; }
    const panel = document.createElement('div');
    panel.id = 'heliosuite-panel';
    panel.style.cssText = `
      position:fixed; left:60px; bottom:16px; z-index:99999;
      min-width:380px; max-width:520px; max-height:70vh; overflow:auto;
      background:var(--hs-panel,#161b22); border:1px solid rgba(255,255,255,.08);
      border-radius:14px; box-shadow:0 14px 34px rgba(0,0,0,.45); padding:14px;
      color:var(--hs-text,#e6edf3); font:14px/1.5 system-ui,Segoe UI,Roboto,Arial;
    `;
    const theme = store.get("HS_THEME","remaster");
    const lastNick = store.get("HS_NICK", nickGuess());
    const world = worldGuess();
    const urlOk = !!CONFIG.WEBAPP_URL;

    panel.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
        <div style="width:36px;height:36px;border-radius:10px;background:#2a2f38;display:flex;align-items:center;justify-content:center">
          <span style="font-size:18px">☀️</span>
        </div>
        <div>
          <div style="font-weight:700; font-size:15px">HeliosSuite</div>
          <div style="color:var(--hs-text-dim,#9aa8b5); font-size:12px">Świat: <b>${world}</b> • Gracz: <b id="hs-nick">${lastNick}</b></div>
        </div>
        <div style="margin-left:auto">
          <select id="hs-theme" style="background:#1f2630;border:1px solid #2c3541;color:#e6edf3;border-radius:8px;padding:4px 8px">
            <option value="remaster"${theme==='remaster'?' selected':''}>Remaster</option>
            <option value="classic"${theme==='classic'?' selected':''}>Classic</option>
            <option value="pirate"${theme==='pirate'?' selected':''}>Pirate</option>
            <option value="dark"${theme==='dark'?' selected':''}>Dark</option>
          </select>
        </div>
      </div>

      <div style="display:flex; gap:12px; flex-wrap:wrap; margin:8px 0 12px">
        <button id="hs-presence" class="hs-btn">Zapisz obecność</button>
        <button id="hs-stats" class="hs-btn">Wyślij statystyki</button>
        <button id="hs-daily" class="hs-btn">Pokaż raport dzienny</button>
      </div>

      <div style="margin-bottom:10px; color:${urlOk?'var(--hs-ok)':'var(--hs-bad)'}">
        ${urlOk ? '✓ WebApp połączony' : '⚠ Brak WEBAPP_URL – uzupełnij w nagłówku skryptu i odśwież stronę'}
      </div>

      <div id="hs-output" style="background:#0f141a;border:1px solid #202b36;border-radius:10px;padding:10px; white-space:pre-wrap; font-family:ui-monospace,Menlo,Consolas"></div>

      <hr style="border:none;border-top:1px solid #2a3440; margin:12px 0">

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
        <div style="background:#0f141a;border:1px solid #202b36;border-radius:10px;padding:10px">
          <div style="font-weight:700;margin-bottom:6px">Skróty</div>
          <ul style="margin:0;padding-left:16px">
            <li><b>G</b> – otwórz HeliosPanel</li>
            <li><b>Shift+L</b> – obecność</li>
            <li><b>Shift+R</b> – raport</li>
          </ul>
        </div>
        <div style="background:#0f141a;border:1px solid #202b36;border-radius:10px;padding:10px">
          <div style="font-weight:700;margin-bottom:6px">Przydatne</div>
          <div id="hs-clock" style="font-variant-numeric:tabular-nums">--:--:--</div>
        </div>
      </div>
    `;

    const styleBtns = `
      .hs-btn{ background:#1f2630; border:1px solid #2c3541; color:#e6edf3; border-radius:10px; padding:8px 10px; cursor:pointer }
      .hs-btn:hover{ transform:translateY(-1px) }
    `;
    GM_addStyle(styleBtns);

    document.body.appendChild(panel);
    panelVisible = true;

    $('#hs-theme')?.addEventListener('change', (e)=> applyTheme(e.target.value));
    $('#hs-presence')?.addEventListener('click', doPresence);
    $('#hs-stats')?.addEventListener('click', doStats);
    $('#hs-daily')?.addEventListener('click', showDaily);

    startClock($('#hs-clock'));
  }

  function startClock(el){
    if (!el) return;
    const tick = () => { const d=new Date(); el.textContent = d.toLocaleString(); };
    tick(); setInterval(tick, 1000);
  }

  /******************************************************************
   * HELIOSPULSE – AKCJE
   ******************************************************************/
  async function doPresence(){
    const nick = nickGuess();
    store.set("HS_NICK", nick);
    const out = $('#hs-output');
    if (!CONFIG.WEBAPP_URL){ out.textContent = "Brak WEBAPP_URL – uzupełnij w skrypcie."; return; }
    const r = await callWebApp("presence", { nick });
    out.textContent = r.ok ? `Obecność OK (${nick})` : `Błąd: ${r.error||r.raw}`;
  }

  async function doStats(){
    const nick = nickGuess();
    store.set("HS_NICK", nick);
    const out = $('#hs-output');
    if (!CONFIG.WEBAPP_URL){ out.textContent = "Brak WEBAPP_URL – uzupełnij w skrypcie."; return; }

    // Z gry trudno ściągnąć „punkty/miasta” bez API – robimy sensowny placeholder:
    // Użytkownik może zmienić manualnie poniżej, albo zrobimy heurystykę z UI.
    const points = guessPointsFromUI() ?? "";
    const towns  = guessTownsFromUI() ?? "";

    const r = await callWebApp("stats", { nick, points, towns, extra:`world=${worldGuess()}` });
    out.textContent = r.ok ? `Statystyki OK (${nick})` : `Błąd: ${r.error||r.raw}`;
  }

  function guessPointsFromUI(){
    // spróbuj znaleźć w elementach tooltipów / paneli (heurystycznie)
    const txt = document.body.textContent;
    const m = txt?.match(/\b(\d{3,})\s*pkt\b/i);
    return m ? Number(m[1]) : null;
  }
  function guessTownsFromUI(){
    const txt = document.body.textContent;
    const m = txt?.match(/\bMiasta:\s*(\d+)\b/i);
    return m ? Number(m[1]) : null;
  }

  async function showDaily(){
    const out = $('#hs-output');
    if (!CONFIG.WEBAPP_URL){ out.textContent = "Brak WEBAPP_URL – uzupełnij w skrypcie."; return; }
    const r = await callWebApp("daily_report_bbcode", { date: todayStr() });
    if (r.ok && (r.raw || r.bbcode)){
      out.textContent = (r.raw || r.bbcode);
    } else {
      out.textContent = `Błąd: ${r.error||'unknown'}`;
    }
  }

  function todayStr(){ const d=new Date(); return d.toISOString().slice(0,10); }

  /******************************************************************
   * LEGALNE HELPERY (rdzeń GrepoFusion – bez automatyzacji klików)
   ******************************************************************/
  function installHelpers(){
    // skróty klawiaturowe
    window.addEventListener('keydown', (e)=>{
      if (e.key.toLowerCase()==='g' && !e.ctrlKey && !e.altKey){
        togglePanel();
      }
      if (e.shiftKey && e.key.toLowerCase()==='l'){
        doPresence();
      }
      if (e.shiftKey && e.key.toLowerCase()==='r'){
        showDaily();
      }
    });

    // mały pasek na górze z szybkimi linkami (opcjonalnie)
    if (!$('#hs-toolbar')){
      const bar = document.createElement('div');
      bar.id = 'hs-toolbar';
      bar.style.cssText = `
        position:fixed; top:0; left:0; right:0; z-index:9999;
        background:rgba(0,0,0,.35); backdrop-filter:blur(6px);
        border-bottom:1px solid rgba(255,255,255,.08);
        color:#fff; font:12px system-ui; padding:4px 10px; display:flex; gap:10px; align-items:center
      `;
      bar.innerHTML = `
        <span style="opacity:.8">HeliosSuite</span>
        <a href="#" id="hs-open" style="color:#f0c66f">Panel</a>
        <a href="#" id="hs-pres" style="color:#8fdf72">Obecność</a>
        <a href="#" id="hs-rep" style="color:#f0c66f">Raport</a>
        <span style="margin-left:auto; opacity:.85">${worldGuess()}</span>
      `;
      bar.querySelector('#hs-open').addEventListener('click', (e)=>{e.preventDefault();togglePanel();});
      bar.querySelector('#hs-pres').addEventListener('click', (e)=>{e.preventDefault();doPresence();});
      bar.querySelector('#hs-rep').addEventListener('click',  (e)=>{e.preventDefault();showDaily();});
      document.body.appendChild(bar);
      // nie nachodzi na treść
      document.body.style.paddingTop = '24px';
    }
  }

  /******************************************************************
   * AUTO-PING (opcjonalny)
   ******************************************************************/
  async function startAutoPing(){
    if (!CONFIG.WEBAPP_URL || !CONFIG.AUTO_PING_EVERY_MIN) return;
    while (true){
      try { await doPresence(); } catch {}
      await sleep(CONFIG.AUTO_PING_EVERY_MIN * 60 * 1000);
    }
  }

  /******************************************************************
   * START
   ******************************************************************/
  function boot(){
    // motyw z pamięci
    applyTheme(store.get("HS_THEME","remaster"));
    // UI
    injectLeftIcon();
    installHelpers();
    // auto-ping
    startAutoPing();
    log("Started on", worldGuess(), "as", nickGuess());
  }

  // Poczekaj aż DOM będzie gotowy i elementy gry dojadą
  const ready = () => document.readyState === "complete" || document.readyState === "interactive";
  if (ready()) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
