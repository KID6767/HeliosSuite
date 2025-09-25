/* ==UserScript==
@name         GrepoFusion - Hub (safe, no automation)
@namespace    https://kid6767.github.io/HeliosSuite/
@version      1.0.0
@description  Panel konfiguracyjny i miejsce na Twoje moduly (bez auto-click)
@match        https://*.grepolis.com/*
@match        http://*.grepolis.com/*
@exclude      https://forum*.grepolis.*
@run-at       document-end
==/UserScript== */
(function(){
  "use strict";
  function ui(){
    var box=document.createElement("div");
    box.style.cssText="position:fixed;left:12px;bottom:12px;background:#111;color:#fff;padding:12px;border-radius:10px;border:1px solid #333;font:12px Arial;z-index:999999;min-width:220px";
    box.innerHTML = "<b>GrepoFusion</b><br>"
      + "<div style='margin-top:8px'>Ten hub NIE wykonuje automatycznych klikniec.<br>"
      + "To bezpieczna przestrzen na Twoje moduly UI/informacyjne.</div>";
    document.body.appendChild(box);
  }
  setTimeout(ui,2500);
})();
