/* ==UserScript==
@name         Aegis - UI Remaster (safe)
@namespace    https://kid6767.github.io/HeliosSuite/
@version      1.0.0
@description  Butelkowa zielen + zloto, prosta stylizacja UI, placeholder logo
@match        https://*.grepolis.com/*
@match        http://*.grepolis.com/*
@exclude      https://forum*.grepolis.*
@run-at       document-start
==/UserScript== */
(function(){
  "use strict";
  var css = ""
  + ":root{--aegis-green:#0e2b23;--aegis-gold:#d4af37;--aegis-bg:#0b1a18}"
  + "body,#ui_box{background:var(--aegis-bg)!important}"
  + "#ui_game_header,.gp_window .gpwindow_content{background:linear-gradient(180deg,var(--aegis-green),#12362e)!important;border-color:var(--aegis-gold)!important}"
  + ".gpwindow .gpwindow_topbar{background:var(--aegis-green)!important}"
  + ".gpwindow .gpwindow_header{color:var(--aegis-gold)!important}"
  + ".button,.btn,.game_button{border-color:var(--aegis-gold)!important;color:#fff!important}"
  + ".button:hover,.btn:hover{filter:brightness(1.1)}"
  + ".overview_header .logo,#ui_box .logo,.gpwindow .logo{background-image:url('https://kid6767.github.io/HeliosSuite/assets/logo_placeholder.svg')!important;background-size:contain!important;background-repeat:no-repeat!important}";
  var st=document.createElement("style");st.textContent=css;document.documentElement.appendChild(st);
})();
