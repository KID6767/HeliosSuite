// ==UserScript==
<<<<<<< HEAD
// @name         HeliosSuite (Aegis + GrepoFusion + HeliosPulse)
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.0
// @description  Motywy (Classic/Remaster/Piracki/Dark), zakładka ustawień jak natywnie, HeliosPulse (presence+raporty), integracje GrepoFusion, Aegis. Naprawa z-index/okien. Lekki czat (alpha).
// @author       HeliosSuite
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @exclude      https://forum*.grepolis.*/*
// @exclude      http://forum*.grepolis.*/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
=======
// @name         HeliosSuite
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.0
// @description  Zintegrowany pakiet: Aegis + GrepoFusion + HeliosPulse
// @author       kid6767
// @match        https://*.grepolis.com/*
// @grant        none
>>>>>>> 1a63a7f63b87a3bb6f63e27f74cbef588414d333
// ==/UserScript==

(function() {
  'use strict';

<<<<<<< HEAD
  /***********************
   * CONFIG – Twoje dane *
   ***********************/
  const CONFIG = {
    WEBAPP_URL: "https://script.google.com/macros/s/AKfycbyHm1SuEMUyfeRUiU9ttQLyfaix1QacKaJhU0tGdB_YQb9ToaWHiRoYA55lPvkmIceq3w/exec",
    TOKEN:      "HeliosPulseToken",
    ALLIANCE:   "Legioniści Heliosa",
    PAGES_URL:  "https://kid6767.github.io/HeliosSuite/"
  };

  /******************************
   * STORAGE (bezpieczne klucze) *
   ******************************/
  const SKEY = {
    THEME:        "helios.theme",            // classic|remaster|pirate|dark
    ENABLED:      "helios.modules",          // {aegis:true, gf:true, hp:true, chat:true}
    UI_FIXES:     "helios.uiFixes",          // bool
    LAST_PRES:    "helios.lastPresence",     // ts
    CHAT_PIN:     "helios.chatPinned",       // bool
    EXP_FEATURES: "helios.expFeatures"       // bool
  };

  function read(key, defVal){
    try{ const v=GM_getValue(key); return (v===undefined? defVal : v);}catch(_){ return defVal; }
  }
  function write(key, val){
    try{ GM_setValue(key, val); }catch(_){}
  }

  /****************
   * THEME MANAGER
   ****************/
  const ThemeManager = (function(){
    const THEMES = {
      classic: {
        label: "Classic",
        vars: {
          "--helios-bg": "#f3efe4",
          "--helios-fg": "#1a1a1a",
          "--helios-accent": "#b8892a",
          "--helios-card": "#fff9ec",
          "--helios-border": "#d7c7a4"
        }
      },
      remaster: {
        label: "Remaster",
        vars: {
          "--helios-bg": "#0e0d0b",
          "--helios-fg": "#f1d78a",
          "--helios-accent": "#ffd35a",
          "--helios-card": "#1d1a15",
          "--helios-border": "#403729"
        }
      },
      pirate: {
        label: "Piracki",
        vars: {
          "--helios-bg": "#07100c",
          "--helios-fg": "#c7f3d8",
          "--helios-accent": "#00c58a",
          "--helios-card": "#0e1a15",
          "--helios-border": "#0f3025"
        }
      },
      dark: {
        label: "Dark",
        vars: {
          "--helios-bg": "#101114",
          "--helios-fg": "#e7e7ea",
          "--helios-accent": "#60a5fa",
          "--helios-card": "#171a1f",
          "--helios-border": "#242833"
        }
      }
    };

    function applyTheme(name){
      const t = THEMES[name] ? name : "remaster";
      write(SKEY.THEME, t);
      const root = document.documentElement;
      const vars = THEMES[t].vars;
      Object.keys(vars).forEach(k=> root.style.setProperty(k, vars[k]));
      document.body.dataset.heliosTheme = t;
=======
  /****************
   * KONFIGURACJA
   ****************/
  const CONFIG = {
    WEBAPP_URL: "https://script.google.com/macros/s/AKfycbyHm1SuEMUyfeRUiU9ttQLyfaix1QacKaJhU0tGdB_YQb9ToaWHiRoYA55lPvkmIceq3w/exec",
    TOKEN: "HELIOSTOKEN2025"
  };

  /****************
   * THEME MANAGER
   ****************/
  const ThemeManager = {
    themes: {
      classic: { name: "Classic", css: "" },
      remaster: { name: "Remaster", css: "body { filter: saturate(1.2); }" },
      pirate: { name: "Piracki", css: "body { background-image: url('https://i.imgur.com/pirate.jpg'); }" },
      dark: { name: "Dark", css: "body { background: #111; color: #ddd; } .gpwindow { background:#222!important; }" },
      night: { name: "Night", css: "body { background: #000; color: #aaa; } .gpwindow { background:#111!important; }" }
    },
    current: localStorage.getItem("helios_theme") || "classic",
    apply(themeKey) {
      if (!this.themes[themeKey]) return;
      this.remove();
      const style = document.createElement("style");
      style.id = "helios-theme";
      style.innerHTML = this.themes[themeKey].css;
      document.head.appendChild(style);
      this.current = themeKey;
      localStorage.setItem("helios_theme", themeKey);
    },
    remove() {
      const old = document.getElementById("helios-theme");
      if (old) old.remove();
>>>>>>> 1a63a7f63b87a3bb6f63e27f74cbef588414d333
    }
  };
  ThemeManager.apply(ThemeManager.current);

<<<<<<< HEAD
    function current(){ return read(SKEY.THEME, "remaster"); }
    function list(){ return Object.keys(THEMES).map(k=> ({key:k, label:THEMES[k].label})); }

    return { applyTheme, current, list };
  })();

  /********************
   * CSS (global fixes)
   ********************/
  GM_addStyle(`
    :root{
      --helios-bg:#0e0d0b; --helios-fg:#f1d78a; --helios-accent:#ffd35a;
      --helios-card:#1d1a15; --helios-border:#403729;
    }
    body[data-helios-theme]{ background-color:var(--helios-bg) !important; color:var(--helios-fg) !important; }
    .helios-card{ background:var(--helios-card); border:1px solid var(--helios-border); border-radius:10px; padding:10px; }
    .helios-btn{ background:var(--helios-accent); color:#000; border:none; border-radius:8px; padding:6px 10px; cursor:pointer; font-weight:bold; }
    .helios-btn:disabled{ opacity:.6; cursor:not-allowed; }
    /* Naprawa "zjeżdżających się" okien / nakładek */
    .gpwindow, .ui-dialog, .ui-dialog.ui-widget{ z-index: 99998 !important; }
    #ui_notebook, #ui_box, #js_game .ui-dialog{ z-index: 99995 !important; }
    #ui_box .ui-dialog-titlebar, .ui-notebook, .ui-dialog .ui-dialog-content{ position:relative; }
    /* Ikona w lewym menu */
    .helios-left-icon{ position:fixed; left:4px; top:160px; z-index:99999; width:34px; height:34px; display:flex; align-items:center; justify-content:center;
      background: linear-gradient(180deg, var(--helios-accent), #fef08a); border-radius:10px; box-shadow:0 6px 20px rgba(0,0,0,.4); cursor:pointer; }
    .helios-left-icon span{ font-size:20px; }
    .helios-left-icon:hover{ transform: translateY(-1px); }
    /* Panel boczny Helios */
    #helios-panel{ position:fixed; right:10px; top:60px; width:360px; max-height:70vh; overflow:auto; z-index:99999; display:none; }
    #helios-panel.active{ display:block; animation: heliosIn .15s ease-out; }
    @keyframes heliosIn{ from{ opacity:0; transform:translateY(-4px);} to{opacity:1; transform:none;} }
    .helios-section + .helios-section{ margin-top:10px; }
    .helios-row{ display:flex; align-items:center; justify-content:space-between; margin:6px 0; }
    .helios-kv{ display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
    .helios-chip{ padding:4px 8px; border-radius:999px; background:rgba(255,255,255,.05); border:1px solid var(--helios-border); }
    .helios-link{ color:var(--helios-accent); text-decoration:underline; cursor:pointer; }
    /* Zakładka Ustawień (jak natywna) */
    .helios-settings-root .tabbar{ display:flex; gap:8px; border-bottom:1px solid var(--helios-border); padding-bottom:6px; margin-bottom:10px; }
    .helios-settings-root .tabbar button{ background:transparent; color:var(--helios-fg); border:1px solid var(--helios-border);
      border-bottom:none; border-top-left-radius:8px; border-top-right-radius:8px; padding:6px 10px; cursor:pointer; }
    .helios-settings-root .tabbar button.active{ background:var(--helios-card); color:var(--helios-accent); }
    .helios-settings-root .tabview{ display:none; }
    .helios-settings-root .tabview.active{ display:block; }
    /* Czat (alpha) */
    #helios-chat{ margin-top:6px; }
    #helios-chat textarea{ width:100%; height:80px; background:#00000022; color:var(--helios-fg); border:1px solid var(--helios-border); border-radius:8px; padding:6px; }
    #helios-chat .chat-log{ height:180px; overflow:auto; background:#00000022; border:1px solid var(--helios-border); border-radius:8px; padding:6px; margin-bottom:6px; }
    #helios-chat .msg{ margin:3px 0; }
    #helios-chat .msg .nick{ color:var(--helios-accent); font-weight:bold; margin-right:6px; }
  `);

  // zastosuj temat od razu
  ThemeManager.applyTheme( ThemeManager.current() );

  /***********************
   * HELIOS UTILS (nick) *
   ***********************/
  function getNick(){
    // heurystyka – Grepolis ma w headerze nick zalogowanego gracza:
    const el = document.querySelector('#ui_box .player_name, #ui_box .gpwindow_content .ui_various .player_name, .game_header .player_name');
    if (el && el.textContent.trim()) return el.textContent.trim();
    // awaryjnie z localStorage (jeśli ktoś już zapisał)
    const stored = read("helios.nick", "");
    if (stored) return stored;
    // fallback: prompt 1x i zapamiętać
    const ask = window.localStorage.getItem("helios.nick") || prompt("Podaj swój nick (1x):","") || "Unknown";
    window.localStorage.setItem("helios.nick", ask);
    write("helios.nick", ask);
    return ask;
  }

  /***********************
   * HELIOSPULSE (presence)
   ***********************/
  async function sendPresenceIfNeeded(){
    const last = parseInt(read(SKEY.LAST_PRES, 0), 10) || 0;
    const now = Date.now();
    // wysyłaj max raz na 15 min
    if (now - last < 15*60*1000) return;
    try{
      const url = CONFIG.WEBAPP_URL + "?action=presence&token="+encodeURIComponent(CONFIG.TOKEN)+"&nick="+encodeURIComponent(getNick());
      // Bez CORS – grepolis domena inna, więc XHR:
      GM_xmlhttpRequest({ method:"GET", url, onload:()=>write(SKEY.LAST_PRES, now), onerror:()=>{} });
    }catch(_){}
  }

  /*********************
   * UI FIXES – włączenie
   *********************/
  function applyUiFixes(){
    // same CSS już wgrane; tu można dodać dynamiczne poprawki jeśli trzeba
    // np. dopasowanie parent dla dialogów:
    try{
      document.querySelectorAll(".ui-dialog").forEach(d=>{
        d.style.position = "fixed";
      });
    }catch(_){}
  }

  /********************
   * LEWE MENU – ikona
   ********************/
  function injectLeftIcon(){
    if (document.getElementById("helios-left-icon")) return;
    const b = document.createElement("div");
    b.id = "helios-left-icon";
    b.className = "helios-left-icon";
    b.title = "HeliosSuite – panel";
    b.innerHTML = `<span>☀️</span>`;
    b.addEventListener("click", ()=> togglePanel());
    document.body.appendChild(b);
  }

  /*****************
   * PANEL PRAWY UI
   *****************/
  function ensurePanel(){
    if (document.getElementById("helios-panel")) return;
    const wrap = document.createElement("div");
    wrap.id = "helios-panel";
    wrap.className = "helios-card";

    wrap.innerHTML = `
      <div class="helios-section">
        <div class="helios-row">
          <div class="helios-kv">
            <span class="helios-chip">HeliosSuite</span>
            <span class="helios-chip"><b>${CONFIG.ALLIANCE}</b></span>
          </div>
          <button id="helios-close" class="helios-btn">✖</button>
        </div>
        <div class="helios-row"><a class="helios-link" target="_blank" href="${CONFIG.PAGES_URL}">🌐 Strona / instalacja</a></div>
      </div>

      <div class="helios-section">
        <div class="helios-row">
          <b>Motyw</b>
          <select id="helios-theme"></select>
        </div>
        <div class="helios-row"><small>Kolory odświeżają się natychmiast dla całego UI.</small></div>
      </div>

      <div class="helios-section">
        <div class="helios-row"><b>Moduły</b></div>
        <label><input type="checkbox" id="mod-aegis"> Aegis (motywy & UI)</label><br>
        <label><input type="checkbox" id="mod-gf"> GrepoFusion (pakiet helperów)</label><br>
        <label><input type="checkbox" id="mod-hp"> HeliosPulse (presence & raporty)</label><br>
        <label><input type="checkbox" id="mod-chat"> Czat (alpha, lokalny)</label><br>
        <label><input type="checkbox" id="mod-uifix"> Naprawy okien / z-index</label>
      </div>

      <div class="helios-section">
        <div class="helios-row"><b>Operacje</b></div>
        <button class="helios-btn" id="helios-pres">Ping obecności</button>
        <button class="helios-btn" id="helios-report">BBCode – raport dzienny</button>
      </div>

      <div class="helios-section" id="helios-chat" style="display:none;">
        <div class="helios-row"><b>Czat (alpha)</b><span><label><input type="checkbox" id="chat-pin"> Przypnij</label></span></div>
        <div class="chat-log" id="chat-log"></div>
        <textarea id="chat-msg" placeholder="Napisz wiadomość (lokalny – widzą tylko ci z tym samym skryptem w danej przeglądarce)"></textarea>
        <div class="helios-row">
          <button class="helios-btn" id="chat-send">Wyślij</button>
          <small>Docelowo: kanały Sojusz/Pakt/Global – via HeliosPulse backend</small>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);

    // Fill themes
    const sel = wrap.querySelector("#helios-theme");
    ThemeManager.list().forEach(t=>{
      const o=document.createElement("option");
      o.value=t.key; o.textContent=t.label;
      if (t.key===ThemeManager.current()) o.selected=true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", e=> ThemeManager.applyTheme(e.target.value) );

    // Modules
    const enabled = read(SKEY.ENABLED, {aegis:true, gf:true, hp:true, chat:false});
    wrap.querySelector("#mod-aegis").checked = !!enabled.aegis;
    wrap.querySelector("#mod-gf").checked   = !!enabled.gf;
    wrap.querySelector("#mod-hp").checked   = !!enabled.hp;
    wrap.querySelector("#mod-chat").checked = !!enabled.chat;

    const uiFix = read(SKEY.UI_FIXES, true);
    wrap.querySelector("#mod-uifix").checked = !!uiFix;

    wrap.querySelector("#mod-aegis").addEventListener("change", ev=> { enabled.aegis = ev.target.checked; write(SKEY.ENABLED, enabled); });
    wrap.querySelector("#mod-gf").addEventListener("change", ev=> { enabled.gf = ev.target.checked; write(SKEY.ENABLED, enabled); });
    wrap.querySelector("#mod-hp").addEventListener("change", ev=> { enabled.hp = ev.target.checked; write(SKEY.ENABLED, enabled); });
    wrap.querySelector("#mod-chat").addEventListener("change", ev=> {
      enabled.chat = ev.target.checked; write(SKEY.ENABLED, enabled);
      document.getElementById("helios-chat").style.display = enabled.chat ? "block":"none";
    });

    wrap.querySelector("#mod-uifix").addEventListener("change", ev=>{
      write(SKEY.UI_FIXES, !!ev.target.checked);
      if (ev.target.checked) applyUiFixes();
    });

    wrap.querySelector("#helios-close").addEventListener("click", ()=> togglePanel(false));

    // Ops
    wrap.querySelector("#helios-pres").addEventListener("click", ()=> sendPresence(true) );
    wrap.querySelector("#helios-report").addEventListener("click", ()=> buildDailyBBCode() );

    // Chat (local alpha)
    const chatPin = read(SKEY.CHAT_PIN, false);
    wrap.querySelector("#chat-pin").checked = chatPin;
    wrap.querySelector("#chat-pin").addEventListener("change", ev=> write(SKEY.CHAT_PIN, !!ev.target.checked));
    wrap.querySelector("#chat-send").addEventListener("click", ()=> chatSend() );

    // Show chat if enabled
    document.getElementById("helios-chat").style.display = enabled.chat ? "block":"none";
  }

  function togglePanel(force){
    const p = document.getElementById("helios-panel");
    if (!p) return;
    const want = (typeof force==="boolean") ? force : !p.classList.contains("active");
    p.classList.toggle("active", want);
  }

  /***************
   * CHAT (local)
   ***************/
  function chatLogArr(){
    try{
      return JSON.parse(window.localStorage.getItem("helios.chatlog")||"[]");
    }catch(_){ return []; }
  }
  function chatSaveArr(arr){
    try{
      window.localStorage.setItem("helios.chatlog", JSON.stringify(arr.slice(-100)));
      renderChat();
    }catch(_){}
  }
  function chatSend(){
    const ta = document.getElementById("chat-msg");
    if (!ta || !ta.value.trim()) return;
    const arr = chatLogArr();
    arr.push({ts:Date.now(), nick:getNick(), txt:ta.value.trim()});
    ta.value="";
    chatSaveArr(arr);
  }
  function renderChat(){
    const log = document.getElementById("chat-log");
    if (!log) return;
    const arr = chatLogArr();
    log.innerHTML = arr.map(m=> `<div class="msg"><span class="nick">${escapeHtml(m.nick)}</span> <span class="txt">${escapeHtml(m.txt)}</span></div>`).join("");
    log.scrollTop = log.scrollHeight;
  }
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

  /*************************
   * HeliosPulse – operacje
   *************************/
  function sendPresence(manual){
    const url = CONFIG.WEBAPP_URL + "?action=presence&token="+encodeURIComponent(CONFIG.TOKEN)+"&nick="+encodeURIComponent(getNick());
    GM_xmlhttpRequest({
      method:"GET", url,
      onload:(r)=> {
        toast("✅ Presence OK");
        write(SKEY.LAST_PRES, Date.now());
        if (manual) console.log("[HeliosPulse] presence response:", r.responseText);
      },
      onerror: ()=> toast("⚠️ Presence ERROR")
    });
  }

  function buildDailyBBCode(){
    const url = CONFIG.WEBAPP_URL + "?action=daily_report_bbcode&token="+encodeURIComponent(CONFIG.TOKEN)+"&date=";
    const dateStr = new Date().toISOString().slice(0,10);
    GM_xmlhttpRequest({
      method:"GET", url: url+dateStr,
      onload:(r)=> {
        const txt = r.responseText || "";
        copyToClipboard(txt);
        toast("📋 BBCode skopiowany (dzisiejszy raport)");
      },
      onerror: ()=> toast("⚠️ Raport: błąd")
    });
  }

  function copyToClipboard(t){
    const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta);
    ta.select(); document.execCommand("copy"); ta.remove();
  }

  /***************
   * TOAST helper
   ***************/
  function toast(msg){
    const id="helios-toast";
    let t = document.getElementById(id);
    if (!t) {
      t=document.createElement("div");
      t.id=id;
      t.style.cssText="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:999999;background:var(--helios-card);border:1px solid var(--helios-border);padding:8px 12px;border-radius:10px;color:var(--helios-fg);box-shadow:0 10px 30px rgba(0,0,0,.4);";
      document.body.appendChild(t);
    }
    t.textContent=msg;
    t.style.display="block";
    setTimeout(()=>{ if (t) t.style.display="none"; }, 1800);
  }

  /*****************
   * SETTINGS TAB  *
   *****************/
  function injectSettingsTab(){
    // pełna „natykówka” na UI Grepolis potrafi się różnić per świat; zrobimy tryb hybrydowy:
    // 1) rejestrujemy menu w Tampermonkey
    GM_registerMenuCommand("HeliosSuite – Ustawienia (panel)", ()=>{ ensurePanel(); togglePanel(true); });
    // 2) dociągamy się pod przycisk w ustawieniach gry (o ile istnieje)
    const tryHook = ()=>{
      const settingsBtn = document.querySelector('#settings_button, .btn_settings');
      if (settingsBtn && !settingsBtn.dataset.heliosBound){
        settingsBtn.dataset.heliosBound="1";
        settingsBtn.addEventListener("click", ()=> setTimeout(()=> hookNatively(), 600));
      }
    };
    const hookNatively = ()=>{
      // znajdź okno ustawień i wstaw „HeliosSuite” jako nową zakładkę
      const container = document.querySelector('.ui-dialog .settings-container, .settings_window, .settings_dialog, .ui-dialog-content .settings');
      if (!container) return;
      if (container.querySelector('.helios-settings-root')) return;

      // stworzymy blok zakładek wewnątrz istniejącego contentu
      const root = document.createElement("div");
      root.className = "helios-settings-root helios-card";
      root.innerHTML = `
        <div class="tabbar">
          <button data-tab="themes" class="active">🎨 Motywy</button>
          <button data-tab="modules">🧩 Moduły</button>
          <button data-tab="pulse">☀️ HeliosPulse</button>
          <button data-tab="chat">💬 Czat</button>
        </div>
        <div class="tabview active" data-view="themes">
          <div class="helios-row"><b>Wybór motywu</b></div>
          <div class="helios-row"><select id="helios-theme2"></select><button class="helios-btn" id="helios-apply2">Zastosuj</button></div>
          <small>Classic / Remaster / Piracki / Dark. Zapis w localStorage (per przeglądarka).</small>
        </div>
        <div class="tabview" data-view="modules">
          <label><input type="checkbox" id="mod-aegis2"> Aegis – motywy & UI</label><br>
          <label><input type="checkbox" id="mod-gf2"> GrepoFusion – pakiet helperów</label><br>
          <label><input type="checkbox" id="mod-hp2"> HeliosPulse – presence+raporty</label><br>
          <label><input type="checkbox" id="mod-chat2"> Czat – lokalny (alpha)</label><br>
          <label><input type="checkbox" id="mod-uifix2"> Naprawy okien/z-index</label>
        </div>
        <div class="tabview" data-view="pulse">
          <div class="helios-row"><b>Operacje</b></div>
          <button class="helios-btn" id="helios-pres2">Ping obecności</button>
          <button class="helios-btn" id="helios-report2">BBCode – dzienny raport</button>
          <div style="margin-top:8px;"><small>WEBAPP: ${CONFIG.WEBAPP_URL}<br/>TOKEN: ${CONFIG.TOKEN}</small></div>
        </div>
        <div class="tabview" data-view="chat">
          <div class="helios-row"><b>Czat (alpha)</b></div>
          <div class="chat-log" id="chat-log2"></div>
          <textarea id="chat-msg2" placeholder="Napisz wiadomość (lokalny)."></textarea>
          <div class="helios-row"><button class="helios-btn" id="chat-send2">Wyślij</button></div>
        </div>
      `;
      container.prepend(root);

      // obsługa tabów
      root.querySelectorAll('.tabbar button').forEach(btn=>{
        btn.addEventListener("click", ()=>{
          root.querySelectorAll('.tabbar button').forEach(b=> b.classList.remove('active'));
          btn.classList.add('active');
          const wanted = btn.dataset.tab;
          root.querySelectorAll('.tabview').forEach(v=> v.classList.toggle('active', v.dataset.view===wanted));
          // przy wejściu w czat – odśwież log
          if (wanted==='chat') renderChat2();
        });
      });

      // tematy
      const sel = root.querySelector("#helios-theme2");
      ThemeManager.list().forEach(t=>{
        const o=document.createElement("option");
        o.value=t.key; o.textContent=t.label;
        if (t.key===ThemeManager.current()) o.selected=true;
        sel.appendChild(o);
      });
      root.querySelector("#helios-apply2").addEventListener("click", ()=> ThemeManager.applyTheme(sel.value) );

      // moduły
      const enabled = read(SKEY.ENABLED, {aegis:true, gf:true, hp:true, chat:false});
      root.querySelector("#mod-aegis2").checked = !!enabled.aegis;
      root.querySelector("#mod-gf2").checked   = !!enabled.gf;
      root.querySelector("#mod-hp2").checked   = !!enabled.hp;
      root.querySelector("#mod-chat2").checked = !!enabled.chat;

      const uiFix = read(SKEY.UI_FIXES, true);
      root.querySelector("#mod-uifix2").checked = !!uiFix;

      root.querySelector("#mod-aegis2").addEventListener("change", ev=> { enabled.aegis = ev.target.checked; write(SKEY.ENABLED, enabled); });
      root.querySelector("#mod-gf2").addEventListener("change", ev=> { enabled.gf = ev.target.checked; write(SKEY.ENABLED, enabled); });
      root.querySelector("#mod-hp2").addEventListener("change", ev=> { enabled.hp = ev.target.checked; write(SKEY.ENABLED, enabled); });
      root.querySelector("#mod-chat2").addEventListener("change", ev=> { enabled.chat = ev.target.checked; write(SKEY.ENABLED, enabled); });

      root.querySelector("#mod-uifix2").addEventListener("change", ev=> {
        write(SKEY.UI_FIXES, !!ev.target.checked);
        if (ev.target.checked) applyUiFixes();
      });

      // pulse
      root.querySelector("#helios-pres2").addEventListener("click", ()=> sendPresence(true) );
      root.querySelector("#helios-report2").addEventListener("click", ()=> buildDailyBBCode() );

      // chat
      root.querySelector("#chat-send2").addEventListener("click", ()=> chatSend2() );
    };

    // próby hookowania (UI bywa SPA)
    setInterval(tryHook, 1500);
  }

  // Chat klon w zakładce ustawień
  function renderChat2(){
    const log = document.getElementById("chat-log2");
    if (!log) return;
    const arr = chatLogArr();
    log.innerHTML = arr.map(m=> `<div class="msg"><span class="nick">${escapeHtml(m.nick)}</span> <span class="txt">${escapeHtml(m.txt)}</span></div>`).join("");
    log.scrollTop = log.scrollHeight;
  }
  function chatSend2(){
    const ta = document.getElementById("chat-msg2");
    if (!ta || !ta.value.trim()) return;
    const arr = chatLogArr();
    arr.push({ts:Date.now(), nick:getNick(), txt:ta.value.trim()});
    ta.value="";
    chatSaveArr(arr);
    renderChat2();
  }

  /********
   * INIT *
   ********/
  function init(){
    // panel + ikona
    ensurePanel();
    injectLeftIcon();

    // presence co jakiś czas
    const enabled = read(SKEY.ENABLED, {aegis:true, gf:true, hp:true, chat:false});
    if (enabled.hp) {
      sendPresenceIfNeeded();
      setInterval(sendPresenceIfNeeded, 5*60*1000);
=======
  /****************
   * SETTINGS UI
   ****************/
  const HeliosSettings = {
    config: JSON.parse(localStorage.getItem("helios_config") || "{}"),

    save() {
      localStorage.setItem("helios_config", JSON.stringify(this.config));
    },

    initTab() {
      const tabId = "helios_tab";
      if ($("#" + tabId).length) return;

      const $menu = $(".settings-menu");
      if ($menu.length) {
        $menu.append(`<li id="${tabId}"><a href="#">⚡ HeliosSuite</a></li>`);
      }

      $("#helios_tab").on("click", () => {
        this.openSettingsWindow();
      });
    },

    openSettingsWindow() {
      const html = `
        <div class="helios-settings">
          <h2>⚡ HeliosSuite – Ustawienia</h2>

          <h3>Motyw</h3>
          <select id="helios_theme_select">
            ${Object.keys(ThemeManager.themes)
              .map(k => `<option value="${k}" ${k===ThemeManager.current?"selected":""}>${ThemeManager.themes[k].name}</option>`)
              .join("")}
          </select>

          <h3>Moduły</h3>
          <label><input type="checkbox" id="helios_aegis" ${this.config.aegis?"checked":""}> Aegis</label><br>
          <label><input type="checkbox" id="helios_grepofusion" ${this.config.grepofusion?"checked":""}> GrepoFusion</label><br>
          <label><input type="checkbox" id="helios_pulse" ${this.config.pulse?"checked":""}> HeliosPulse</label>

          <h3>Eksperymentalne</h3>
          <label><input type="checkbox" id="helios_darkmode" ${this.config.darkmode?"checked":""}> Tryb nocny</label>
        </div>
      `;

      const win = GPWindowMgr.Create(GPWindowMgr.TYPE_MESSAGE, "HeliosSuite", null);
      const $w = $(win.getJQElement());
      $w.find(".gpwindow_content").html(html);

      $("#helios_theme_select").on("change", e => {
        ThemeManager.apply(e.target.value);
      });

      $("#helios_aegis,#helios_grepofusion,#helios_pulse,#helios_darkmode").on("change", e => {
        this.config.aegis = $("#helios_aegis").is(":checked");
        this.config.grepofusion = $("#helios_grepofusion").is(":checked");
        this.config.pulse = $("#helios_pulse").is(":checked");
        this.config.darkmode = $("#helios_darkmode").is(":checked");
        this.save();
      });
>>>>>>> 1a63a7f63b87a3bb6f63e27f74cbef588414d333
    }
  };

<<<<<<< HEAD
    // naprawy UI
    if (read(SKEY.UI_FIXES, true)) applyUiFixes();

    // czat – nasłuchiwanie zmian z localStorage (inne karty)
    window.addEventListener("storage", (e)=>{
      if (e.key==="helios.chatlog"){ renderChat(); renderChat2(); }
    });

    // settings tab
    injectSettingsTab();

    // 1st render chat
    renderChat();
  }

  // start po załadowaniu
  const start = ()=>{
    if (document.readyState === "complete" || document.readyState === "interactive") init();
    else document.addEventListener("DOMContentLoaded", init);
  };
  start();

})();
=======
  /****************
   * MODULES
   ****************/
  const Modules = {
    init() {
      if (HeliosSettings.config.aegis) this.aegis();
      if (HeliosSettings.config.grepofusion) this.grepofusion();
      if (HeliosSettings.config.pulse) this.pulse();
    },

    aegis() {
      console.log("[Aegis] aktywny");
      // TODO: pełne UI Senatu/Agory na złoto-czarno
    },

    grepofusion() {
      console.log("[GrepoFusion] aktywny");
      // TODO: zintegrowane moduły (Map Enhancer, Zeitrechner, City Indexer...)
    },

    pulse() {
      console.log("[HeliosPulse] aktywny");
      // TODO: raporty w UI gry
    }
  };

  /****************
   * INIT
   ****************/
  function init() {
    console.log("[HeliosSuite] start");
    HeliosSettings.initTab();
    Modules.init();
  }

  $(document).ready(init);

})();
>>>>>>> 1a63a7f63b87a3bb6f63e27f74cbef588414d333
