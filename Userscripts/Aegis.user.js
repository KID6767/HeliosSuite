// ==UserScript==
// @name         Aegis (UI Remaster)
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.1
// @description  Zielono-złoty styl dla Grepolis
// @match        https://*.grepolis.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';
  const css = `
    .gpwindow_container, .ui-dialog { border-radius:12px !important; }
    .gpwindow { box-shadow: 2px 2px 8px rgba(0,0,0,0.4) !important; }
    body { background: radial-gradient(circle, #0b3d0b, #001a00) !important; }
    .ui-dialog-titlebar { background:#ffd700 !important; color:#111 !important; font-weight:bold; }
  `;
  const s=document.createElement("style"); s.textContent=css; document.head.appendChild(s);
})();
