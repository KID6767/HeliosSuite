// ==UserScript==
// @name         HeliosPulse — Presence & Reports (Sheets)
// @namespace    https://github.com/KID6767/HeliosSuite
// @version      1.0.0
// @description  Ikona „Raporty Helios” w menu; ping obecności; podgląd raportu z Google Apps Script (JSON/BBCode) + link do pełnej strony sojuszu.
// @author       KID6767
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @run-at       document-end
// @connect      script.google.com
// @grant        GM_xmlhttpRequest
// @downloadURL  https://raw.githubusercontent.com/KID6767/HeliosSuite/main/Userscripts/HeliosPulse.user.js
// @updateURL    https://raw.githubusercontent.com/KID6767/HeliosSuite/main/Userscripts/HeliosPulse.user.js
// ==/UserScript==
(function () {
  'use strict';

  const CONFIG = {
    WEBAPP_URL: "https://script.google.com/macros/s/....../exec", // <-- wstaw tutaj swój EXEC URL z Google Apps Script
    TOKEN: "HeliosPulseToken",
    PAGES_URL: "https://kid6767.github.io/HeliosSuite/"
  };

  function getNick(){
    // Spróbuj odczytać nick z UI; jeśli się nie uda, zapytaj użytkownika raz i zapisz w localStorage
    const LS='HP_NICK';
    const fromLS = localStorage.getItem(LS);
    if (fromLS) return fromLS;
    const fallback = prompt("Podaj swój nick w grze (dla HeliosPulse):","Alpakiz") || "Unknown";
    localStorage.setItem(LS, fallback);
    return fallback;
  }

  function apiGet(params, onOk, onErr){
    if (!CONFIG.WEBAPP_URL) { toast("HeliosPulse: brak WEBAPP_URL — ustaw go w pliku."); return; }
    const q = new URLSearchParams(Object.assign({ token: CONFIG.TOKEN }, params)).toString();
    GM_xmlhttpRequest({
      method:'GET',
      url: CONFIG.WEBAPP_URL + "?" + q,
      onload: (r)=>{
        try {
          if (r.status!==200) throw new Error("HTTP "+r.status);
          onOk && onOk(r.responseText);
        } catch (e){ onErr && onErr(e); }
      },
      onerror: (e)=> onErr && onErr(e)
    });
  }

  function toast(msg){
    const d=document.createElement('div');
    d.textContent=msg;
    d.style.cssText='position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#111;color:#ffd26a;padding:10px 14px;border-radius:10px;z-index:999999;box-shadow:0 8px 24px rgba(0,0,0,.4)';
    document.body.appendChild(d);
    setTimeout(()=>d.remove(),2500);
  }

  // Ikona „Raporty Helios”
  function addSidebarIcon(){
    if (document.getElementById('hp-icon')) return;
    const btn = document.createElement('div');
    btn.id='hp-icon';
    btn.title='HeliosPulse — Raporty';
    btn.style.cssText='position:fixed;left:10px;bottom:150px;width:40px;height:40px;border-radius:9px;background:radial-gradient(ellipse at 40% 30%, #ffd26a, transparent 60%);box-shadow:0 8px 18px rgba(0,0,0,.45);cursor:pointer;z-index:999999;';
    btn.onclick = openPanel;
    document.body.appendChild(btn);
  }

  function openPanel(){
    let w=document.getElementById('hp-panel');
    if (!w){
      w=document.createElement('div');
      w.id='hp-panel';
      w.style.cssText='position:fixed;right:16px;top:16px;width:480px;max-width:92vw;background:#0f1218;color:#eee;border-radius:12px;padding:12px;border:1px solid rgba(255,255,255,.06);box-shadow:0 10px 30px rgba(0,0,0,.45);z-index:999999';
      w.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="font-weight:800;letter-spacing:.5px;color:#ffd26a">HeliosPulse — Raport dzienny</div>
        <button id="hp-close" style="background:#ffd26a;border:none;border-radius:8px;padding:6px 10px;color:#111;font-weight:800;cursor:pointer">X</button>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:8px;">
        <input id="hp-date" type="date" style="flex:1;background:#131722;border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#fff;padding:6px 8px">
        <button id="hp-refresh" class="hp-btn">Odśwież</button>
        <a id="hp-full" class="hp-btn" href="${CONFIG.PAGES_URL}" target="_blank">Pełny raport</a>
      </div>
      <pre id="hp-out" style="white-space:pre-wrap;background:#10151c;border-radius:8px;padding:10px;max-height:52vh;overflow:auto;border:1px solid rgba(255,255,255,.06)"></pre>
      <style>.hp-btn{background:#ffd26a;border:none;border-radius:8px;padding:6px 10px;color:#111;font-weight:800;cursor:pointer}</style>
      `;
      document.body.appendChild(w);
      w.querySelector('#hp-close').onclick = ()=> w.remove();
      w.querySelector('#hp-refresh').onclick = ()=> loadReport();
    }
    loadReport();
  }

  function loadReport(){
    const date = document.getElementById('hp-date');
    if (!date.value){
      const d=new Date(); date.value = d.toISOString().slice(0,10);
    }
    apiGet({ action:'daily_report_bbcode', date: date.value }, (txt)=>{
      document.getElementById('hp-out').textContent = txt;
    }, ()=>{
      document.getElementById('hp-out').textContent = 'Błąd pobierania raportu. Sprawdź WEBAPP_URL / uprawnienia Apps Script.';
    });
  }

  // Ping obecności (raz per sesja)
  function pingPresenceOnce(){
    const KEY='HP_PINGED_'+(new Date()).toISOString().slice(0,10);
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY,'1');
    apiGet({ action:'presence', nick: getNick() }, ()=> toast('HeliosPulse: Obecność odnotowana ✔'), ()=>{});
  }

  function start(){
    addSidebarIcon();
    pingPresenceOnce();
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

