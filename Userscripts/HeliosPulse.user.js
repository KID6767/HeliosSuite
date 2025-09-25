// ==UserScript==
// @name         HeliosPulse â€” Presence & Reports (safe)
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.0
// @description  Ping obecnoĹ›ci (do Google Apps Script) + pobieranie BBCode raportu; NIE wykonuje automatycznych akcji w grze.
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @exclude      https://forum*.grepolis.*
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==
(function(){
  "use strict";
  const CONFIG = {
    WEBAPP_URL: "https://script.google.com/macros/s/AKfycbzl-XWLBfFa-Zk9LpU5gsHm6udl7FcQktTast8piZCW/dev", // <-- wklej URL WebApp po deploy
    TOKEN: "HeliosPulseToken"
  };

  function getNick(){
    try{ if (window.game_data && game_data.player_name) return game_data.player_name; }catch(e){}
    return "Unknown";
  }

  function pingPresence(){
    if(!CONFIG.WEBAPP_URL) return;
    const url = CONFIG.WEBAPP_URL + "?action=presence&token=" + encodeURIComponent(CONFIG.TOKEN) + "&nick=" + encodeURIComponent(getNick());
    GM_xmlhttpRequest({ method:"GET", url: url, onload: ()=>console.log("[HP] presence ok"), onerror: ()=>console.log("[HP] presence err") });
  }

  function addUI(){
    if(document.getElementById("hp_box")) return;
    const box = document.createElement("div");
    box.id = "hp_box";
    box.style.cssText = "position:fixed;right:12px;bottom:80px;background:#0f201d;color:#f1d78a;padding:10px;border-radius:10px;border:1px solid #222;z-index:999999;font-family:Arial";
    box.innerHTML = '<div style="font-weight:bold">HeliosPulse</div><div style="font-size:12px;margin:6px 0">Nick: ' + getNick() + '</div><button id="hp_btn">Pobierz raport (BBCode)</button> <button id="hp_store">Zapisz szkic</button><div id="hp_msg" style="margin-top:6px;font-size:11px;color:#ccc"></div>';
    document.body.appendChild(box);
    document.getElementById("hp_btn").onclick = fetchBB;
    document.getElementById("hp_store").onclick = storeDraft;
  }

  function fetchBB(){
    if(!CONFIG.WEBAPP_URL){ alert("Ustaw WEBAPP_URL w HeliosPulse.user.js"); return; }
    const date = new Date().toISOString().slice(0,10);
    const url = CONFIG.WEBAPP_URL + "?action=daily_report_bbcode&date=" + encodeURIComponent(date) + "&token=" + encodeURIComponent(CONFIG.TOKEN);
    GM_xmlhttpRequest({ method:"GET", url:url, onload: (r)=>showBB(r.responseText || "Brak treĹ›ci"), onerror: ()=>alert("BĹ‚Ä…d pobierania") });
  }

  function storeDraft(){
    if(!CONFIG.WEBAPP_URL){ alert("Ustaw WEBAPP_URL w HeliosPulse.user.js"); return; }
    const payload = { token: CONFIG.TOKEN, action:"store_post", date:new Date().toISOString(), thread:"Raport dzienny", author:getNick(), title:"Raport dzienny " + new Date().toISOString().slice(0,10), content:"Szkic wygenerowany przez HeliosPulse", notes:"autodeploy" };
    GM_xmlhttpRequest({ method:"POST", url:CONFIG.WEBAPP_URL, headers:{"Content-Type":"application/json"}, data:JSON.stringify(payload), onload: ()=>alert("Szkic zapisany"), onerror: ()=>alert("BĹ‚Ä…d zapisu") });
  }

  function showBB(text){
    const id="hp_modal";
    const ex=document.getElementById(id); if(ex) ex.remove();
    const m=document.createElement("div"); m.id=id;
    m.style.cssText="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:70%;height:60%;background:#0b0b0b;color:#f1d78a;padding:12px;border-radius:10px;z-index:1000000;overflow:auto";
    m.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><b>BBCode</b><div><button id=\"hp_copy\">Kopiuj</button> <button id=\"hp_close\">Zamknij</button></div></div><pre style="white-space:pre-wrap;margin-top:8px" id="hp_bb">'+(text||"")+'</pre>';
    document.body.appendChild(m);
    document.getElementById("hp_close").onclick = ()=>m.remove();
    document.getElementById("hp_copy").onclick = ()=>{ const t=document.getElementById("hp_bb").textContent; navigator.clipboard?.writeText(t).then(()=>alert("Skopiowano")); };
  }

  addUI();
  pingPresence();
  setInterval(pingPresence, 5*60*1000);
})();
