/* ==UserScript==
@name         HeliosPulse - Presence & Stats (safe)
@namespace    https://kid6767.github.io/HeliosSuite/
@version      1.0.0
@description  Ping obecnosci i last_seen do Google Apps Script; lekki panel z linkiem do strony
@match        https://*.grepolis.com/*
@match        http://*.grepolis.com/*
@exclude      https://forum*.grepolis.*
@grant        GM_xmlhttpRequest
@run-at       document-end
==/UserScript== */
(function(){
  "use strict";
  var CONFIG = {
    WEBAPP_URL: "https://script\.google\.com/macros/s/AKfycbzl-XWLBfFa-Zk9LpU5gsHm6udl7FcQktTast8piZCW/dev",
    TOKEN: "HeliosPulseToken",
    PAGES: "https://kid6767.github.io/HeliosSuite/"
  };

  function getNick(){
    try{ return (window && window.Game && window.Game.player_name) || "Unknown"; }
    catch(e){ return "Unknown"; }
  }
  function send(action, extra){
    if(!CONFIG.WEBAPP_URL) return;
    var url = CONFIG.WEBAPP_URL+"?token="+encodeURIComponent(CONFIG.TOKEN)
            +"&action="+encodeURIComponent(action)
            +"&nick="+encodeURIComponent(getNick())
            +(extra?("&"+extra):"")
            +"&_="+Date.now();
    GM_xmlhttpRequest({method:"GET",url:url,onload:function(){}});
  }
  function presence(){ send("presence","source=userscript"); }
  function lastSeen(){ send("last_seen","source=userscript"); }

  function panel(){
    var box=document.createElement("div");
    box.style.cssText="position:fixed;right:12px;bottom:12px;background:#1c1f24;color:#ffd700;padding:10px 12px;border-radius:8px;font:12px Arial;z-index:999999;border:1px solid #37414a";
    box.innerHTML='<b>HeliosPulse</b> <a target="_blank" style="color:#fff;text-decoration:underline;margin-left:8px" href="'+CONFIG.PAGES+'">Strona</a>';
    document.body.appendChild(box);
  }

  setTimeout(presence,1500);
  setInterval(lastSeen,300000);
  setTimeout(panel,2500);
})();
