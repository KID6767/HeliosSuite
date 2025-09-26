// ==UserScript==
// @name         HeliosSuite (TEMP MONO) — Aegis + GrepoFusion + HeliosPulse
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.2.0
// @description  Zakładka w Ustawieniach + motywy (Aegis) + GrepoFusion + HeliosPulse + poprawki UI (okna/raporty/z-index). Skrót: Shift+H
// @author       HeliosSuite
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  /* =========================
   *  KONFIG
   * ========================= */
  const CONFIG = {
    WEBAPP_URL: "https://script.google.com/macros/s/AKfycbyHm1SuEMUyfeRUiU9ttQLyfaix1QacKaJhU0tGdB_YQb9ToaWHiRoYA55lPvkmIceq3w/exec",
    TOKEN     : "HeliosPulseToken",
    STORAGE_KEY: "heliosuite.settings.v1",
    LOG       : "[HeliosSuite]"
  };

  const DEFAULTS = {
    aegis: {
      theme: "Classic",          // Classic | Remaster | Piracki | Dark
      dayNight: "auto",          // auto | day | night
      uiFixes: true,
      widePopups: true,
      compactLists: true
    },
    grepoFusion: {
      enabled: true,
      cityIndexer: true,
      mapLayers: true,
      exportCSV: true
    },
    heliosPulse: {
      enabled: true,
      presencePing: true,
      bbcodeLang: "pl"
    }
  };

  /* =========================
   *  UTIL
   * ========================= */
  const log = (...a) => console.log(CONFIG.LOG, ...a);

  const deepMerge = (t,s)=>{for(const k of Object.keys(s)){if(s[k]&&typeof s[k]==="object"&&!Array.isArray(s[k])){t[k]=t[k]||{};deepMerge(t[k],s[k])}else t[k]=s[k];}return t;};

  const loadSettings = () => {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULTS);
      return deepMerge(structuredClone(DEFAULTS), JSON.parse(raw));
    } catch { return structuredClone(DEFAULTS); }
  };
  const saveSettings = s => localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(s));

  const waitFor = (cond, timeout=20000, step=80) => new Promise((res,rej)=>{
    const t0=Date.now(), id=setInterval(()=>{
      try{
        if(cond()){clearInterval(id); res(true);}
        else if(Date.now()-t0>timeout){clearInterval(id); rej(new Error("waitFor timeout")); }
      }catch(e){clearInterval(id); rej(e);}
    }, step);
  });

  /* =========================
   *  HELIOSPULSE (API)
   * ========================= */
  const HP = (() => {
    const nick = ()=> (window.game_data && window.game_data.player_name) || "Unknown";
    function pingPresence() {
      if(!CONFIG.WEBAPP_URL) return;
      const url = `${CONFIG.WEBAPP_URL}?action=presence&token=${encodeURIComponent(CONFIG.TOKEN)}&nick=${encodeURIComponent(nick())}&ts=${Date.now()}`;
      GM_xmlhttpRequest({method:"GET", url, onload:()=>log("presence OK"), onerror:e=>console.warn(CONFIG.LOG,"presence ERR",e)});
    }
    // stub pod generator BBCode raportu do rozbudowy
    function buildDailyReportBBCode(lang="pl"){
      const date = new Date().toISOString().slice(0,10);
      return `[b]HeliosPulse — Raport dzienny[/b]\nData: ${date}\n\n[i]Wersja mono. Sekcje zostaną rozwinięte w finalu.[/i]`;
    }
    return { pingPresence, buildDailyReportBBCode };
  })();

  /* =========================
   *  AEGIS: THEMING
   * ========================= */
  const Theme = (() => {
    const root = document.documentElement;
    const BASE_CLASS = "hs-aegis";
    const THEMES = {
      Classic : "hs-theme-classic",
      Remaster: "hs-theme-remaster",
      Piracki : "hs-theme-piracki",
      Dark    : "hs-theme-dark"
    };

    const computeDayNight = m => m==="day"?"day":m==="night"?"night":(((h)=>h>=20||h<6)(new Date().getHours())?"night":"day");

    function apply(s){
      root.classList.add(BASE_CLASS);
      Object.values(THEMES).forEach(c=>root.classList.remove(c));
      root.classList.add(THEMES[s.aegis.theme]||THEMES.Classic);

      root.classList.remove("hs-day","hs-night");
      root.classList.add(computeDayNight(s.aegis.dayNight)==="night"?"hs-night":"hs-day");

      toggle("hs-ui-fixes", !!s.aegis.uiFixes);
      toggle("hs-wide-popups", !!s.aegis.widePopups);
      toggle("hs-compact-lists", !!s.aegis.compactLists);
    }
    const toggle=(cls,on)=> on?root.classList.add(cls):root.classList.remove(cls);
    return { apply };
  })();

  /* =========================
   *  GREPOFUSION — STUBY
   * ========================= */
  const GF = (() => {
    // Proste API do potem podpięcia realnych modułów (indexer/CSV/layers)
    function enableModules(s){
      log("GrepoFusion ->", s);
      // tutaj wywołania realnych modułów gdy zostaną scalone
    }
    return { enableModules };
  })();

  /* =========================
   *  UI — ZAKŁADKA W USTAWIENIACH
   * ========================= */
  const UI = (() => {
    let state = loadSettings();

    function mount(){
      // skrót do otwarcia zakładki
      window.addEventListener("keydown",e=>{
        if(e.shiftKey && e.key.toLowerCase()==="h"){ openFromAnySettingsWindow(); }
      });

      // obserwuj okna
      const obs = new MutationObserver(injectIfSettings);
      obs.observe(document.body,{childList:true,subtree:true});
      injectIfSettings();
    }

    function isSettings(win){
      try{
        const t = win.querySelector(".gpwindow_header .gpwindow_title")?.textContent?.toLowerCase()||"";
        return !!win.querySelector(".gpwindow_content") && (t.includes("ustawienia")||t.includes("settings"));
      }catch{ return false; }
    }

    function injectIfSettings(){
      document.querySelectorAll(".gpwindow").forEach(w=>{
        if(!isSettings(w)) return;
        const tabs = w.querySelector(".settings-menu, .ui_tabs, .tabbar, .gp_tabbar") || w.querySelector(".settings_tabs");
        const area = w.querySelector(".gpwindow_content");
        if(!tabs||!area) return;

        if(!tabs.querySelector(".hs-tab-button")){
          const btn=document.createElement("div");
          btn.className="hs-tab-button ui_tab";
          btn.textContent="HeliosSuite";
          btn.title="Aegis • GrepoFusion • HeliosPulse";
          btn.addEventListener("click",()=>show(area,tabs,btn));
          tabs.appendChild(btn);
        }
      });
    }

    function openFromAnySettingsWindow(){
      const w = [...document.querySelectorAll(".gpwindow")].find(isSettings);
      if(!w) return;
      const tabs = w.querySelector(".settings-menu, .ui_tabs, .tabbar, .gp_tabbar") || w.querySelector(".settings_tabs");
      const area = w.querySelector(".gpwindow_content");
      const btn  = tabs.querySelector(".hs-tab-button");
      if(btn) { btn.click(); } else { show(area,tabs,btn); }
    }

    function show(area,tabs,btn){
      tabs.querySelectorAll(".ui_tab, .tab, .selected").forEach(el=>el.classList.remove("selected"));
      if(btn) btn.classList.add("selected");
      area.innerHTML="";
      const wrap=document.createElement("div");
      wrap.className="hs-pane";
      wrap.innerHTML = render();
      area.appendChild(wrap);
      bind(wrap);
    }

    function render(){
      const s = state;
      return `
        <div class="hs-pane-header">
          <div class="hs-logo">HeliosSuite</div>
          <div class="hs-sub">Aegis • GrepoFusion • HeliosPulse</div>
        </div>

        <div class="hs-tabs">
          <button class="hs-tab hs-tab--active" data-tab="aegis">Aegis (motywy)</button>
          <button class="hs-tab" data-tab="fusion">GrepoFusion</button>
          <button class="hs-tab" data-tab="pulse">HeliosPulse</button>
        </div>

        <div class="hs-tabview">
          <!-- AEGIS -->
          <section class="hs-section" data-view="aegis" style="display:block">
            <h3>Motyw i wygląd</h3>
            <label class="hs-row">
              <span>Motyw:</span>
              <select id="hs-aegis-theme">
                ${["Classic","Remaster","Piracki","Dark"].map(v=>`<option value="${v}" ${s.aegis.theme===v?"selected":""}>${v}</option>`).join("")}
              </select>
            </label>
            <label class="hs-row">
              <span>Tryb dobowy:</span>
              <select id="hs-aegis-daynight">
                ${[["auto","Auto (noc 20:00–6:00)"],["day","Dzienny"],["night","Nocny"]].map(([v,t])=>`<option value="${v}" ${s.aegis.dayNight===v?"selected":""}>${t}</option>`).join("")}
              </select>
            </label>
            <label class="hs-row">
              <span>Poprawki UI (z-index, tła, kontrast):</span>
              <input type="checkbox" id="hs-aegis-uifixes" ${s.aegis.uiFixes?"checked":""}>
            </label>
            <label class="hs-row">
              <span>Szerokie okna (raporty/ustawienia):</span>
              <input type="checkbox" id="hs-aegis-wide" ${s.aegis.widePopups?"checked":""}>
            </label>
            <label class="hs-row">
              <span>Kompaktowe listy (mniej przewijania):</span>
              <input type="checkbox" id="hs-aegis-compact" ${s.aegis.compactLists?"checked":""}>
            </label>
            <div class="hs-actions"><button class="hs-btn" id="hs-aegis-apply">Zastosuj</button></div>
          </section>

          <!-- GREPOFUSION -->
          <section class="hs-section" data-view="fusion">
            <h3>GrepoFusion — moduły</h3>
            <label class="hs-row"><span>Włącz GrepoFusion:</span> <input type="checkbox" id="hs-gf-enabled" ${s.grepoFusion.enabled?"checked":""}></label>
            <label class="hs-row"><span>City Indexer:</span> <input type="checkbox" id="hs-gf-indexer" ${s.grepoFusion.cityIndexer?"checked":""}></label>
            <label class="hs-row"><span>Warstwy mapy:</span> <input type="checkbox" id="hs-gf-layers" ${s.grepoFusion.mapLayers?"checked":""}></label>
            <label class="hs-row"><span>Eksport CSV:</span> <input type="checkbox" id="hs-gf-csv" ${s.grepoFusion.exportCSV?"checked":""}></label>
            <div class="hs-note">Przełączniki aktywują/dezaktywują moduły GF (API przygotowane, logika wpinana sukcesywnie).</div>
          </section>

          <!-- HELIOSPULSE -->
          <section class="hs-section" data-view="pulse">
            <h3>HeliosPulse</h3>
            <label class="hs-row"><span>Włącz HeliosPulse:</span> <input type="checkbox" id="hs-hp-enabled" ${s.heliosPulse.enabled?"checked":""}></label>
            <label class="hs-row"><span>Ping obecności (ręczny):</span> <input type="checkbox" id="hs-hp-presence" ${s.heliosPulse.presencePing?"checked":""}> <button class="hs-btn" id="hs-hp-ping">Wyślij teraz</button></label>
            <label class="hs-row"><span>Język BBCode:</span> <select id="hs-hp-bblang">${["pl","en","de"].map(v=>`<option value="${v}" ${s.heliosPulse.bbcodeLang===v?"selected":""}>${v}</option>`).join("")}</select></label>
            <div class="hs-actions"><button class="hs-btn" id="hs-hp-preview">Podgląd raportu (BBCode)</button></div>
          </section>
        </div>

        <div class="hs-footer">
          <button class="hs-btn hs-primary" id="hs-save">Zapisz</button>
          <button class="hs-btn" id="hs-cancel">Anuluj</button>
        </div>
      `;
    }

    function bind(root){
      // tabs
      root.querySelectorAll(".hs-tab").forEach(b=>{
        b.addEventListener("click",()=>{
          root.querySelectorAll(".hs-tab").forEach(x=>x.classList.remove("hs-tab--active"));
          b.classList.add("hs-tab--active");
          const v=b.dataset.tab;
          root.querySelectorAll(".hs-section").forEach(s=>s.style.display=(s.dataset.view===v)?"block":"none");
        });
      });

      // Aegis apply
      root.querySelector("#hs-aegis-apply").addEventListener("click",()=>{ state = collect(root); Theme.apply(state); toast("Zastosowano motyw."); });

      // HP ping
      root.querySelector("#hs-hp-ping").addEventListener("click",()=>{
        const s = collect(root);
        if(s.heliosPulse.enabled && s.heliosPulse.presencePing){ HP.pingPresence(); toast("Wysłano ping obecności."); }
        else alert("Włącz HeliosPulse oraz Ping obecności.");
      });

      // HP preview
      root.querySelector("#hs-hp-preview").addEventListener("click",()=>{
        const s = collect(root);
        const bb = HP.buildDailyReportBBCode(s.heliosPulse.bbcodeLang);
        showModal("Podgląd BBCode", `<textarea style="width:100%;height:240px">${bb}</textarea>`);
      });

      // SAVE
      root.querySelector("#hs-save").addEventListener("click",()=>{
        state = collect(root);
        saveSettings(state);
        Theme.apply(state);
        GF.enableModules(state.grepoFusion);
        toast("Zapisano ustawienia.");
      });

      root.querySelector("#hs-cancel").addEventListener("click",()=>toast("Anulowano."));
    }

    function collect(root){
      const s = structuredClone(state);
      // Aegis
      s.aegis.theme = root.querySelector("#hs-aegis-theme").value;
      s.aegis.dayNight = root.querySelector("#hs-aegis-daynight").value;
      s.aegis.uiFixes = root.querySelector("#hs-aegis-uifixes").checked;
      s.aegis.widePopups = root.querySelector("#hs-aegis-wide").checked;
      s.aegis.compactLists = root.querySelector("#hs-aegis-compact").checked;

      // GF
      s.grepoFusion.enabled = root.querySelector("#hs-gf-enabled").checked;
      s.grepoFusion.cityIndexer = root.querySelector("#hs-gf-indexer").checked;
      s.grepoFusion.mapLayers = root.querySelector("#hs-gf-layers").checked;
      s.grepoFusion.exportCSV = root.querySelector("#hs-gf-csv").checked;

      // HP
      s.heliosPulse.enabled = root.querySelector("#hs-hp-enabled").checked;
      s.heliosPulse.presencePing = root.querySelector("#hs-hp-presence").checked;
      s.heliosPulse.bbcodeLang = root.querySelector("#hs-hp-bblang").value;

      return s;
    }

    return { mount, applyOnLoad: ()=>Theme.apply(state), enableGF: ()=>GF.enableModules(state.grepoFusion) };
  })();

  /* =========================
   *  STYLE
   * ========================= */
  const CSS = `
  /* Root & palette */
  :root.hs-aegis{
    --hs-bg: rgba(10,14,22,.78);
    --hs-bd: #233245;
    --hs-ac: #3d5afe;
    --hs-txt: #e7ecff;
    --hs-sub: #b7c0e0;
  }

  /* Themes (color tweaks) */
  .hs-theme-classic :root {}
  .hs-theme-remaster { --hs-ac:#00d0ff; --hs-bg: rgba(10,16,24,.82); }
  .hs-theme-piracki  { --hs-ac:#ffc400; --hs-bg: rgba(26,18,6,.82); }
  .hs-theme-dark     { --hs-ac:#90caf9; --hs-bg: rgba(12,14,18,.85); }

  /* Day/Night effect */
  .hs-night body, .hs-night .gpwindow_content { filter: brightness(.93) contrast(1.02); }

  /* Global UI fixes */
  .hs-ui-fixes .gpwindow        { z-index: 100000 !important; }
  .hs-ui-fixes .gpwindow_header { position: relative; z-index: 2; }
  .hs-ui-fixes .gpwindow_content{ position: relative; z-index: 1; }
  .hs-ui-fixes .report_wrapper,
  .hs-ui-fixes .gpwindow_content .content { background: var(--hs-bg) !important; }
  .hs-wide-popups .gpwindow_content { max-width: 1200px !important; }
  .hs-compact-lists .ui_list li { padding: 2px 6px !important; }

  /* our settings pane */
  .hs-pane{padding:12px;background:var(--hs-bg);border:1px solid var(--hs-bd);border-radius:8px;color:var(--hs-txt);}
  .hs-pane-header{display:flex;gap:8px;align-items:baseline;margin-bottom:8px}
  .hs-logo{font-size:18px;font-weight:700;letter-spacing:.4px}
  .hs-sub{color:var(--hs-sub)}
  .hs-tabs{display:flex;gap:8px;margin:10px 0}
  .hs-tab{padding:6px 10px;border:1px solid var(--hs-bd);background:#1e2a3f;color:#dfe7ff;border-radius:4px;cursor:pointer}
  .hs-tab--active{background:#2c3e64;border-color:#4b5ea6}
  .hs-section{background:rgba(0,0,0,.2);border:1px solid var(--hs-bd);border-radius:6px;padding:10px}
  .hs-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0}
  .hs-actions{margin-top:8px}
  .hs-btn{padding:6px 10px;border:1px solid #47587a;background:#2c3650;color:#fff;border-radius:4px;cursor:pointer}
  .hs-btn:hover{filter:brightness(1.08)}
  .hs-primary{background:var(--hs-ac);border-color:#3148c9}
  .hs-footer{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}
  .hs-note{margin-top:8px;font-size:12px;opacity:.9}
  .hs-tab-button.ui_tab{user-select:none}
  `;

  const injectStyle = css => { const s=document.createElement("style"); s.textContent=css; document.head.appendChild(s); };
  const toast = msg => { const d=document.createElement("div"); d.textContent=msg; d.style.cssText="position:fixed;bottom:16px;left:16px;z-index:100001;background:#2c3650;color:#fff;padding:8px 10px;border:1px solid #47587a;border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,.35)"; document.body.appendChild(d); setTimeout(()=>d.remove(),2000); };
  const showModal = (title, html) => {
    const m = document.createElement("div");
    m.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:100002;display:flex;align-items:center;justify-content:center";
    m.innerHTML = `<div style="min-width:560px;max-width:800px;background:#101726;border:1px solid #31425c;border-radius:8px;color:#fff">
      <div style="padding:10px 12px;border-bottom:1px solid #223;"><b>${title}</b></div>
      <div style="padding:12px">${html}</div>
      <div style="padding:10px 12px;border-top:1px solid #223;text-align:right"><button id="hs-close" class="hs-btn">Zamknij</button></div>
    </div>`;
    m.querySelector("#hs-close").addEventListener("click",()=>m.remove());
    document.body.appendChild(m);
  };

  /* =========================
   *  INIT
   * ========================= */
  (async function init(){
    injectStyle(CSS);
    UI.applyOnLoad();
    try{ await waitFor(()=>document.querySelector(".gpwindow")||document.querySelector("#ui_box")); }catch{}
    UI.mount();
    UI.enableGF();
    log("ready");
  })();

})();
