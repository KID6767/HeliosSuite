// ==UserScript==
// @name         HeliosSuite (Aegis + GrepoFusion + HeliosPulse)
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      0.9.0
// @description  Panel + zakładka w ustawieniach, motywy, moduły (Aegis/GrepoFusion/HeliosPulse), ping obecności do GAS, naprawy UI.
// @author       KID6767
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @exclude      https://forum*.grepolis.*/*
// @exclude      http://forum*.grepolis.*/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==
(() => {
  "use strict";

  /****************
   * CONFIG
   ****************/
  const CONFIG_DEFAULT = {
    WEBAPP_URL: "https://script.google.com/macros/s/AKfycbyHm1SuEMUyfeRUiU9ttQLyfaix1QacKaJhU0tGdB_YQb9ToaWHiRoYA55lPvkmIceq3w/exec",
    TOKEN:      "HeliosPulseToken",
    theme:      "goldblack",           // classic | goldblack | dark
    modules: {
      Aegis:        true,              // warstwa wizualna
      HeliosPulse:  true,              // pingi obecności + UI
      GrepoFusion:  true               // stub automatyzacji (rozszerzymy)
    },
    ui: {
      showWelcomeOnStart: true,
      pinButtonTop: true
    },
    lastPresenceAt: 0
  };

  const STORE_KEY = "HS_CONFIG";

  const HS = {
    state: loadConfig(),
    save() { localStorage.setItem(STORE_KEY, JSON.stringify(this.state)); },
    log(...a){ console.log("%c[HeliosSuite]", "color:#ffd257;background:#1d1a15;padding:2px 6px;border-radius:6px", ...a); }
  };

  function loadConfig(){
    try{
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return {...CONFIG_DEFAULT};
      const parsed = JSON.parse(raw);
      return {...CONFIG_DEFAULT, ...parsed, modules:{...CONFIG_DEFAULT.modules, ...(parsed.modules||{})}, ui:{...CONFIG_DEFAULT.ui, ...(parsed.ui||{})}};
    }catch(_){ return {...CONFIG_DEFAULT}; }
  }

  /****************
   * CSS & THEME
   ****************/
  const baseCSS = `
  /* reset / zmiany warstw UI */
  .hs-hidden { display:none !important; }
  #hs-floating-btn {
    position: fixed; right: 18px; top: 82px; z-index: 99999;
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(145deg,#2a261f,#1a1713);
    border:1px solid #6d5a2f; box-shadow: 0 4px 14px rgba(0,0,0,.5);
    color:#ffd257; display:flex; align-items:center; justify-content:center;
    cursor:pointer; font-weight:700; font-size:16px; letter-spacing:.5px;
  }
  #hs-floating-btn:hover{ filter:brightness(1.1); transform: translateY(-1px); }

  #hs-panel {
    position: fixed; right: 16px; top: 130px; width: 420px; max-height: 80vh; overflow: auto;
    z-index: 99998; border-radius: 14px; border:1px solid #6d5a2f;
    box-shadow: 0 16px 40px rgba(0,0,0,.6);
    background: rgba(26,23,19,.96); color:#e8d8a6; backdrop-filter: blur(3px);
  }
  #hs-panel header{ padding:12px 14px; border-bottom: 1px solid #6d5a2f; display:flex; justify-content:space-between; align-items:center;}
  #hs-panel header .title{ font-weight:800; letter-spacing:.6px; color:#ffd257;}
  #hs-panel .hs-section{ padding:12px 14px; }
  #hs-panel .hs-row{ display:flex; gap:10px; align-items:center; margin:8px 0;}
  #hs-panel label{ flex:1; }
  #hs-panel input[type="checkbox"]{ transform: scale(1.15); }
  #hs-panel select, #hs-panel button{
    background:#2a251e; border:1px solid #6d5a2f; color:#f6e8b4; border-radius:8px; padding:6px 8px;
  }
  #hs-panel .hs-tag{ background:#2e271e; color:#cdb476; border:1px solid #6d5a2f; border-radius:999px; padding:2px 8px; font-size:11px; margin-left:6px; }
  #hs-panel .muted{ opacity:.8; font-size:12px; }

  /* zakładka w ustawieniach (render własny w oknie) */
  .hs-settings-host { padding:10px; }
  .hs-settings-title { font-weight: 800; margin-bottom: 8px; color:#ffd257; }
  .hs-hr { border:0; height:1px; background: #5f4b24; margin:8px 0; opacity:.6; }

  /* Fix na z-index „zjeżdżających się okien” */
  .gpwindow_content, .gpwindow {
    z-index: 2000 !important;
  }
  .ui-dialog, .ui-widget-overlay { z-index: 3000 !important; }

  /* Motywy – przełączamy klasą na body: .hs-theme-classic / .hs-theme-goldblack / .hs-theme-dark */
  body.hs-theme-goldblack {
    --hs-bg:#1d1a15; --hs-panel:#1f1b16; --hs-accent:#ffd257; --hs-border:#6d5a2f; --hs-text:#f1e4c2;
    background: radial-gradient(1200px 600px at 20% 0%, rgba(255,210,90,.05), transparent 60%), #0f0e0c;
  }
  body.hs-theme-dark {
    --hs-bg:#0c0e12; --hs-panel:#10131a; --hs-accent:#7ed0ff; --hs-border:#2a3a53; --hs-text:#e6f0ff;
    background: radial-gradient(1200px 600px at 80% 0%, rgba(124,180,255,.06), transparent 60%), #080a0f;
  }
  body.hs-theme-classic {
    --hs-bg:#171717; --hs-panel:#202020; --hs-accent:#f0f0f0; --hs-border:#3a3a3a; --hs-text:#f0f0f0;
    background: #121212;
  }
  body[class*="hs-theme-"] #hs-panel {
    background: var(--hs-panel);
    color: var(--hs-text);
    border-color: var(--hs-border);
  }
  body[class*="hs-theme-"] #hs-panel header .title { color: var(--hs-accent); }
  body[class*="hs-theme-"] #hs-floating-btn {
    background: var(--hs-panel);
    border-color: var(--hs-border);
    color: var(--hs-accent);
  }

  /* Parę miejsc UI Grepolis zmieniamy od razu, by efekt był widoczny */
  body[class*="hs-theme-"] #ui_box .game_header { filter: saturate(1.05) brightness(1.02); }
  body.hs-theme-goldblack #ui_box .game_header { background: linear-gradient(#2a251e,#1f1b16) !important; }
  body.hs-theme-dark #ui_box .game_header { background: linear-gradient(#12151b,#0d1016) !important; }
  body.hs-theme-goldblack .gpwindow .gpwindow_header { background:#251f19 !important; border-color:#6d5a2f !important; }
  body.hs-theme-dark .gpwindow .gpwindow_header { background:#0f131a !important; border-color:#2a3a53 !important; }
  body.hs-theme-goldblack .gpwindow .gpwindow_content { background:#1f1b16 !important; }
  body.hs-theme-dark .gpwindow .gpwindow_content { background:#10131a !important; }

  /* lewy dock ikon – delikatne „Aegis” */
  #ui_box .advisor_frame, #ui_box .ui_resources { border-radius: 8px; overflow: hidden; }
  `;

  GM_addStyle(baseCSS);

  function applyTheme(){
    const body = document.body;
    body.classList.remove("hs-theme-classic","hs-theme-goldblack","hs-theme-dark");
    const th = HS.state.theme || "goldblack";
    body.classList.add("hs-theme-" + th);
  }
  applyTheme();

  /****************
   * UI: Floating button + Panel
   ****************/
  function ensureButton(){
    if (document.getElementById("hs-floating-btn")) return;
    const b = document.createElement("div");
    b.id = "hs-floating-btn";
    b.title = "HeliosSuite (panel)";
    b.textContent = "HS";
    b.addEventListener("click", togglePanel);
    document.body.appendChild(b);
  }

  function togglePanel(){
    const p = document.getElementById("hs-panel");
    if (p) { p.remove(); return; }
    openPanel();
  }

  function openPanel(){
    closePanel();
    const host = document.createElement("div");
    host.id = "hs-panel";

    host.innerHTML = `
      <header>
        <div class="title">HeliosSuite – Panel</div>
        <div>
          <span class="hs-tag">v0.9</span>
          <button id="hs-close">✕</button>
        </div>
      </header>
      <div class="hs-section">
        <div class="hs-row">
          <label>Motyw</label>
          <select id="hs-theme">
            <option value="classic">Classic</option>
            <option value="goldblack">Gold/Black</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div class="hs-row">
          <label>Panel powitalny po starcie</label>
          <input id="hs-welcome" type="checkbox">
        </div>
        <hr class="hs-hr">
        <div class="hs-settings-title">Moduły</div>
        <div class="hs-row">
          <label>Aegis (warstwa wizualna)</label>
          <input id="hs-mod-aegis" type="checkbox">
        </div>
        <div class="hs-row">
          <label>HeliosPulse (obecność + raporty)</label>
          <input id="hs-mod-hp" type="checkbox">
        </div>
        <div class="hs-row">
          <label>GrepoFusion (automatyzacje)</label>
          <input id="hs-mod-gf" type="checkbox">
        </div>
        <hr class="hs-hr">
        <div class="muted">
          WEBAPP: ${HS.state.WEBAPP_URL ? `<code>${HS.state.WEBAPP_URL.split("/").slice(0,6).join("/")}/exec</code>` : "<i>brak</i>"}<br>
          TOKEN: <code>${HS.state.TOKEN||"—"}</code>
        </div>
      </div>
    `;
    document.body.appendChild(host);

    // bindy
    host.querySelector("#hs-close").onclick = () => host.remove();

    const sel = host.querySelector("#hs-theme");
    sel.value = HS.state.theme;
    sel.onchange = (e)=> { HS.state.theme = e.target.value; HS.save(); applyTheme(); };

    const w = host.querySelector("#hs-welcome");
    w.checked = !!HS.state.ui.showWelcomeOnStart;
    w.onchange = (e)=> { HS.state.ui.showWelcomeOnStart = e.target.checked; HS.save(); };

    const a = host.querySelector("#hs-mod-aegis");
    const hp= host.querySelector("#hs-mod-hp");
    const gf= host.querySelector("#hs-mod-gf");
    a.checked  = !!HS.state.modules.Aegis;
    hp.checked = !!HS.state.modules.HeliosPulse;
    gf.checked = !!HS.state.modules.GrepoFusion;
    a.onchange  = ()=> { HS.state.modules.Aegis = a.checked; HS.save(); applyAegis(); };
    hp.onchange = ()=> { HS.state.modules.HeliosPulse = hp.checked; HS.save(); };
    gf.onchange = ()=> { HS.state.modules.GrepoFusion = gf.checked; HS.save(); };
  }

  function closePanel(){ const p = document.getElementById("hs-panel"); if (p) p.remove(); }

  /****************
   * HELIOSPULSE – ping obecności (GAS)
   ****************/
  function pingPresenceOnce(){
    if (!HS.state.modules.HeliosPulse) return;
    const now = Date.now();
    if (now - (HS.state.lastPresenceAt||0) < 5*60*1000) return; // max 1 ping / 5 min
    if (!HS.state.WEBAPP_URL || !HS.state.TOKEN) return;

    const nick = tryGetNick();
    const url  = `${HS.state.WEBAPP_URL}?action=presence&token=${encodeURIComponent(HS.state.TOKEN)}&nick=${encodeURIComponent(nick)}`;

    try{
      GM_xmlhttpRequest({
        method: "GET",
        url,
        onload: () => { HS.log("HeliosPulse presence ok"); HS.state.lastPresenceAt = Date.now(); HS.save(); },
        onerror: (e)=> HS.log("HeliosPulse presence error", e)
      });
    }catch(err){ HS.log("GM_xmlhttpRequest error", err); }
  }

  function tryGetNick(){
    try{
      // Typowo Grepolis ma nazwę użytkownika w elemencie z klasą .ui_player_name
      const el = document.querySelector(".ui_player_name");
      if (el && el.textContent.trim()) return el.textContent.trim();
    }catch(_){}
    return "Unknown";
  }

  /****************
   * AEGIS – warstwa wizualna (lekka, bez obrazów zewn.)
   ****************/
  function applyAegis(){
    // Na razie proste klasy + CSS (wyżej). Później: podmiana ikon/tiles – tu dorzucimy assety.
    // Jeśli wyłączone – przywróć „classic” bez wymiany tła okien.
    if (!HS.state.modules.Aegis){
      document.body.classList.remove("hs-theme-goldblack","hs-theme-dark");
      document.body.classList.add("hs-theme-classic");
    } else {
      applyTheme();
    }
  }

  /****************
   * Zakładka w Ustawieniach (Aplikacje)
   ****************/
  function injectSettingsTab(){
    // Nie ruszamy „wnętrza” oryginalnego systemu – renderujemy własny blok w oknie ustawień,
    // jeżeli takie okno się pojawi i ma „Aplikacje”.
    const dialog = document.querySelector(".ui_dialog .content, .gpwindow_content");
    const appsTab = document.querySelector(".settings_content, .settings-container, .settings"); // luźny selektor
    const already = document.getElementById("hs-settings-embed");
    if (!dialog || !appsTab || already) return;

    const host = document.createElement("div");
    host.id = "hs-settings-embed";
    host.className = "hs-settings-host";
    host.innerHTML = `
      <div class="hs-settings-title">HeliosSuite</div>
      <div class="hs-row">
        <label>Motyw</label>
        <select id="hs-s-theme">
          <option value="classic">Classic</option>
          <option value="goldblack">Gold/Black</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div class="hs-row">
        <label>Aegis (UI)</label>
        <input id="hs-s-aegis" type="checkbox">
      </div>
      <div class="hs-row">
        <label>HeliosPulse (obecność)</label>
        <input id="hs-s-hp" type="checkbox">
      </div>
      <div class="hs-row">
        <label>GrepoFusion</label>
        <input id="hs-s-gf" type="checkbox">
      </div>
      <hr class="hs-hr">
      <div class="muted">Zmiany zapisywane automatycznie • Panel: przycisk „HS” przy prawym górnym rogu.</div>
    `;
    (appsTab || dialog).appendChild(host);

    // bind:
    const st = host.querySelector("#hs-s-theme");  st.value = HS.state.theme; st.onchange = e=>{ HS.state.theme = e.target.value; HS.save(); applyTheme(); };
    const sa = host.querySelector("#hs-s-aegis");  sa.checked = !!HS.state.modules.Aegis;       sa.onchange = e=>{ HS.state.modules.Aegis = e.target.checked; HS.save(); applyAegis(); };
    const sh = host.querySelector("#hs-s-hp");     sh.checked = !!HS.state.modules.HeliosPulse; sh.onchange = e=>{ HS.state.modules.HeliosPulse = e.target.checked; HS.save(); };
    const sg = host.querySelector("#hs-s-gf");     sg.checked = !!HS.state.modules.GrepoFusion; sg.onchange = e=>{ HS.state.modules.GrepoFusion = e.target.checked; HS.save(); };
  }

  /****************
   * Dodatkowy dostęp: „Aplikacje” → pseudo-zakładka
   ****************/
  function injectAppsEntry(){
    // W topowym „Apps/Plugins” nie mamy oficjalnego hooka – więc dokładamy mini-link do otwarcia panelu HS.
    if (document.getElementById("hs-mini-gear")) return;
    const hdr = document.querySelector("#ui_box .game_header");
    if (!hdr) return;
    const mini = document.createElement("div");
    mini.id = "hs-mini-gear";
    mini.style.cssText = "position:absolute; right:66px; top:6px; z-index:99999; cursor:pointer; font-size:12px; color:#ffd257; background:rgba(0,0,0,.25); padding:4px 6px; border:1px solid #6d5a2f; border-radius:8px;";
    mini.textContent = "HeliosSuite";
    mini.title = "Otwórz HeliosSuite";
    mini.onclick = openPanel;
    hdr.appendChild(mini);
  }

  /****************
   * INIT
   ****************/
  function init(){
    HS.log("Init…");
    ensureButton();
    applyAegis();

    // Pokaż panel na starcie (opcjonalnie)
    if (HS.state.ui.showWelcomeOnStart) {
      setTimeout(() => { openPanel(); }, 800);
    }

    // Ping obecności po kilku sekundach (po zalogowaniu/odświeżeniu)
    setTimeout(pingPresenceOnce, 3500);

    // Nasłuch na okna – by doiniekcjować naszą zakładkę w Ustawieniach
    const obs = new MutationObserver(() => {
      injectSettingsTab();
      injectAppsEntry();
    });
    obs.observe(document.body, { childList:true, subtree:true });

    // Od razu też spróbuj:
    injectSettingsTab();
    injectAppsEntry();
  }

  // Odpal
  init();

})();
