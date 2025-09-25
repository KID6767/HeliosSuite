// ==UserScript==
// @name         GrepoFusion (hub safe)
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.1
// @description  Hub dla dodatkowych narzędzi, eksport CSV, snapshoty
// @match        https://*.grepolis.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  function createHub(){
    if(document.getElementById("gf_panel")) return;
    const box=document.createElement("div");
    box.id="gf_panel";
    box.style.cssText="position:fixed;left:12px;top:80px;background:#0b0b0b;color:#ffd700;padding:10px;border-radius:10px;border:1px solid #555;z-index:99999;";
    box.innerHTML="<b>⚡ GrepoFusion</b><br><button id='gf_export'>📥 Export CSV</button>";
    document.body.appendChild(box);

    document.getElementById("gf_export").onclick = ()=>{
      const data = [["Nick","Punkty","Miasta"]];
      if(window.game_data && window.game_data.player_name){
        data.push([game_data.player_name, game_data.player_points || "?", game_data.towns || "?"]);
      }
      const csv = data.map(r=>r.join(",")).join("\n");
      const a=document.createElement("a");
      a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
      a.download="snapshot.csv";
      a.click();
    };
  }

  setTimeout(createHub,2000);
})();
