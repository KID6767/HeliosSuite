// ==UserScript==
// @name         HeliosPulse (obecność + raporty)
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.1
// @description  Ping obecności i dzienne raporty dla sojuszu
// @match        https://*.grepolis.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  const CONFIG = {
    NICK: (typeof game_data !== 'undefined' && game_data.player_name) ? game_data.player_name : "Unknown",
    WEBAPP_URL: "WSTAW_TUTAJ_URL_WEBAPP" // <- tu trzeba wkleić URL z Google Apps Script
  };

  function pingPresence(){
    fetch(`${CONFIG.WEBAPP_URL}?action=presence&nick=${encodeURIComponent(CONFIG.NICK)}&token=HeliosPulseToken`)
      .then(r=>r.text()).then(console.log).catch(console.error);
  }

  function addUI(){
    const btn = document.createElement("button");
    btn.textContent = "📊 Raport dzienny";
    btn.style.cssText = "position:fixed;bottom:10px;left:10px;z-index:999999;background:#111;color:#ffd700;padding:5px 10px;border-radius:5px;border:1px solid #333;cursor:pointer;";
    btn.onclick = ()=>{
      fetch(`${CONFIG.WEBAPP_URL}?action=daily_report_bbcode&token=HeliosPulseToken`)
        .then(r=>r.text()).then(txt=>{
          navigator.clipboard.writeText(txt);
          alert("📋 Skopiowano raport BBCode do schowka!");
        });
    };
    document.body.appendChild(btn);
  }

  setInterval(pingPresence, 5*60*1000); // co 5 minut
  setTimeout(addUI, 3000);
})();



