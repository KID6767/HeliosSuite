// ==UserScript==
// @name         HeliosPulse — Raporty & Obecność (UI)
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.0
// @description  Ikona „Helios” w menu, meldowanie obecności, podgląd raportu dziennego (BBCode) – wszystko w oknie w grze.
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @grant        GM_xmlhttpRequest
// @connect      script.google.com
// @run-at       document-end
// ==/UserScript==
(function(){
  'use strict';

  const CONFIG = {
    WEBAPP_URL: "",              // <- Wklej swój /exec
    TOKEN: "HeliosPulseToken",   // <- jak w Twoim .gs
    NICK:  (window.Game && Game.player_name) || (document.body.dataset.playerName || "Unknown")
  };

  // Proste UI: ikona w lewym menu
  addMenuIcon();
  function addMenuIcon(){
    const menu = document.querySelector('.menu_inner') || document.querySelector('#ui_box .menu_inner');
    if(!menu) { setTimeout(addMenuIcon, 1000); return; }
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href = "#";
    a.title = "Helios – Raporty / Obecność";
    a.innerHTML = `<span class="icon"></span><span class="left"></span><span class="right">☀ Helios</span>`;
    a.addEventListener('click', (e)=>{ e.preventDefault(); openWindow(); });
    li.appendChild(a);
    menu.appendChild(li);

    // prosta złota ikona
    const css = `
      .menu_inner a:has(.right:contains("Helios")) .icon,
      .menu_inner a .right:contains("Helios") { color:#f3d07a !important; }
      .menu_inner a .icon::before {
        content:''; position:absolute; inset:0;
      }
    `;
    injectCSS(css);
  }

  function openWindow(){
    let w = document.getElementById('hp_window');
    if (w){ w.style.display='block'; return; }
    w = document.createElement('div');
    w.id='hp_window';
    w.style.cssText='position:fixed;z-index:999999;top:120px;left:calc(50% - 280px);width:560px;background:#1b1813;color:#f1e7c8;border:1px solid #3b3326;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.5);';
    w.innerHTML = `
      <div style="padding:10px 12px;border-bottom:1px solid #3b3326;display:flex;justify-content:space-between;align-items:center;">
        <div style="color:#f3d07a;font-weight:700">☀ HeliosPulse</div>
        <div>
          <button id="hp_btn_presence">Zamelduj obecność</button>
          <button id="hp_btn_refresh">Odśwież raport</button>
          <button id="hp_btn_close">✕</button>
        </div>
      </div>
      <div style="padding:10px 12px;">
        <div style="margin-bottom:6px;opacity:.85">Nick: <b>${CONFIG.NICK}</b></div>
        <div id="hp_status" style="margin-bottom:8px;color:#f3d07a;"></div>
        <div><b>📊 Raport dzienny (BBCode)</b></div>
        <textarea id="hp_bbcode" style="width:100%;height:220px;background:#14110c;color:#f1e7c8;border:1px solid #3b3326;border-radius:6px;margin-top:6px;"></textarea>
        <div style="margin-top:8px;display:flex;gap:8px;">
          <button id="hp_copy">Kopiuj BBCode</button>
          <a id="hp_pages" href="#" target="_blank" style="color:#f3d07a">Pełny raport online</a>
        </div>
      </div>
    `;
    document.body.appendChild(w);

    // style przycisków
    injectCSS(`
      #hp_window button{
        background:linear-gradient(180deg,#2a241a,#1b170f);border:1px solid #3b3326;color:#e6c15b;border-radius:6px;padding:6px 9px;cursor:pointer;
      } #hp_window button:hover{ filter:brightness(1.1);}
    `);

    byId('hp_btn_close').addEventListener('click', ()=> w.remove());
    byId('hp_btn_presence').addEventListener('click', pingPresence);
    byId('hp_btn_refresh').addEventListener('click', loadBBCode);
    byId('hp_copy').addEventListener('click', copyBBCode);

    loadBBCode();
  }

  function pingPresence(){
    if (!CONFIG.WEBAPP_URL){ return msg('Ustaw WEBAPP_URL w HeliosPulse.user.js'); }
    const url = `${CONFIG.WEBAPP_URL}?token=${encodeURIComponent(CONFIG.TOKEN)}&action=presence&nick=${encodeURIComponent(CONFIG.NICK)}`;
    req(url, (ok,res)=>{
      msg(ok? 'Obecność zapisana.' : ('Błąd: '+res));
    });
  }

  function loadBBCode(){
    if (!CONFIG.WEBAPP_URL){ return msg('Ustaw WEBAPP_URL w HeliosPulse.user.js'); }
    const url = `${CONFIG.WEBAPP_URL}?token=${encodeURIComponent(CONFIG.TOKEN)}&action=daily_report_bbcode`;
    req(url, (ok,res)=>{
      if(ok){
        byId('hp_bbcode').value = res;
        // link do pages (jeśli backend zwraca w BBCode lub znasz swój URL – podmień)
        byId('hp_pages').href = 'https://kid6767.github.io/HeliosPulse/'; // podmień na właściwy jeśli inny
        msg('Raport załadowany.');
      }else{
        msg('Błąd raportu: '+res);
      }
    });
  }

  function copyBBCode(){
    const ta = byId('hp_bbcode');
    ta.select(); document.execCommand('copy');
    msg('Skopiowano do schowka.');
  }

  // net helper
  function req(url, cb){
    try{
      GM_xmlhttpRequest({
        method:'GET', url,
        onload:(r)=> cb(true, r.responseText),
        onerror:(e)=> cb(false, String(e && e.error || 'net error'))
      });
    }catch(err){ cb(false, String(err));}
  }

  // utils
  function byId(id){ return document.getElementById(id); }
  function injectCSS(s){ const st=document.createElement('style'); st.textContent=s; document.head.appendChild(st); }
  function msg(t){ const n=byId('hp_status'); if(n) n.textContent = t; }
})();
