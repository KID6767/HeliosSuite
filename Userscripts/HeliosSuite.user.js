// ==UserScript==
// @name         HeliosSuite — Loader (Aegis + GrepoFusion + HeliosPulse)
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.0
// @description  Jeden skrypt, który ładuje moduły z GitHuba (Aegis/GrepoFusion/HeliosPulse) + przycisk HS w UI.
// @author       Helios Team
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @exclude      https://forum*.grepolis.*/*
// @exclude      http://forum*.grepolis.*/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(() => {
  'use strict';

  const CDN = {
    // GitHub Pages (preferowane) – pamiętaj, by mieć w repo folder docs/ z modułami:
    pagesRoot: 'https://kid6767.github.io/HeliosSuite',
    // Fallback (raw) jeśli Pages nie działa:
    rawRoot:   'https://raw.githubusercontent.com/kid6767/HeliosSuite/main'
  };

  const CORE = {
    WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbyHm1SuEMUyfeRUiU9ttQLyfaix1QacKaJhU0tGdB_YQb9ToaWHiRoYA55lPvkmIceq3w/exec',
    TOKEN:      'HeliosPulseToken',
    theme:      localStorage.getItem('HS_theme') || 'goldblack', // goldblack|dark|classic
    modules: {
      aegis:        true,
      grepoFusion:  true,
      heliosPulse:  true
    }
  };

  // Minimalny styler + “HS” przy prawym górnym rogu (otwiera panel modułów)
  GM_addStyle(`
    #hs-badge{position:fixed;right:64px;top:8px;z-index:99999;padding:6px 9px;border-radius:10px;
      border:1px solid #6d5a2f;background:#1f1b16;color:#ffd257;font-weight:700;cursor:pointer;display:flex;gap:6px;align-items:center}
    #hs-badge:hover{filter:brightness(1.06)}
    .hs-toast{position:fixed;right:18px;bottom:18px;background:rgba(25,22,18,.96);color:#f1e4c2;border:1px solid #6d5a2f;
      padding:10px 12px;border-radius:10px;z-index:99999;box-shadow:0 10px 24px rgba(0,0,0,.5)}
  `);

  function toast(msg){
    const el=document.createElement('div'); el.className='hs-toast'; el.textContent=msg;
    document.body.appendChild(el); setTimeout(()=>el.remove(), 2800);
  }

  function addBadge(){
    if (document.getElementById('hs-badge')) return;
    const b=document.createElement('div'); b.id='hs-badge'; b.title='HeliosSuite';
    b.innerHTML='⚙️ HS';
    b.onclick = () => {
      const ev = new CustomEvent('HS:openPanel', { detail: { from:'badge' }});
      window.dispatchEvent(ev);
    };
    document.body.appendChild(b);
  }

  function scriptUrl(relPath){
    // próbujemy Pages → jak 404, lecimy Raw
    return new Promise(resolve=>{
      const pages = `${CDN.pagesRoot}/${relPath}`;
      fetch(pages, {method:'HEAD', cache:'no-store'}).then(r=>{
        if (r.ok) resolve(pages);
        else resolve(`${CDN.rawRoot}/${relPath}`);
      }).catch(()=> resolve(`${CDN.rawRoot}/${relPath}`));
    });
  }

  async function inject(relPath){
    const url = await scriptUrl(relPath);
    const s = document.createElement('script'); s.src = url + `?nocache=${Date.now()}`;
    s.onload = ()=> toast(`Załadowano: ${relPath}`);
    s.onerror = ()=> toast(`Błąd ładowania: ${relPath}`);
    document.head.appendChild(s);
  }

  // Eksport core do modułów
  window.HeliosSuiteCore = {
    getConfig(){ return {...CORE}; },
    setTheme(t){ localStorage.setItem('HS_theme', t); CORE.theme=t; applyTheme(); },
    applyTheme,
  };

  function applyTheme(){
    document.body.classList.remove("hs-theme-goldblack","hs-theme-dark","hs-theme-classic");
    document.body.classList.add("hs-theme-"+(CORE.theme||"goldblack"));
  }

  // motyw na starcie
  GM_addStyle(`
    body.hs-theme-goldblack{--hs-bg:#1d1a15;--hs-panel:#1f1b16;--hs-accent:#ffd257;--hs-text:#f1e4c2;--hs-border:#6d5a2f;background:#0f0e0c;}
    body.hs-theme-dark{--hs-bg:#0c0e12;--hs-panel:#10131a;--hs-accent:#7ed0ff;--hs-text:#e6f0ff;--hs-border:#2a3a53;background:#080a0f;}
    body.hs-theme-classic{--hs-bg:#171717;--hs-panel:#202020;--hs-accent:#f0f0f0;--hs-text:#f0f0f0;--hs-border:#3a3a3a;background:#121212;}
  `);
  applyTheme();

  // Załaduj moduły
  (async () => {
    addBadge();

    if (CORE.modules.aegis)       await inject('modules/aegis.js');
    if (CORE.modules.grepoFusion) await inject('modules/grepoFusion.js');
    if (CORE.modules.heliosPulse) await inject('modules/heliosPulse.js');

    // hook: pokaż panel po 1s po wejściu (tylko raz na sesję)
    if (!sessionStorage.getItem('HS_welcome_shown')){
      setTimeout(()=>window.dispatchEvent(new CustomEvent('HS:openPanel',{detail:{from:'welcome'}})), 1000);
      sessionStorage.setItem('HS_welcome_shown','1');
    }
  })();

})();
