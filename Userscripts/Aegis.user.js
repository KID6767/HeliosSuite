// ==UserScript==
// @name         Aegis â€” UI Remaster (safe)
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.0
// @description  Cosmetic UI improvements only (no automation).
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @exclude      https://forum*.grepolis.*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function(){
  const css = `
    .gpwindow_container, .ui-dialog { border-radius:10px !important; }
    .gpwindow { box-shadow:0 12px 30px rgba(0,0,0,0.4) !important; }
    body{ background: radial-gradient(1200px 800px at 50% 0%, #0b1614, #090909) !important; }
  `;
  const s=document.createElement("style"); s.textContent=css; document.head.appendChild(s);
})();
