// ==UserScript==
// @name         GrepoFusion Hub (safe)
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.0
// @description  Panel pomocniczy: eksport CSV / otwieranie okna tworzenia wÄ…tku (rÄ™czne wklejenie BBCode).
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @exclude      https://forum*.grepolis.*
// @grant        none
// @run-at       document-end
// ==/UserScript==
(function(){
  "use strict";
  function createPanel(){
    if(document.getElementById("gf_panel")) return;
    const p = document.createElement("div");
    p.id = "gf_panel";
    p.style.cssText = "position:fixed;left:12px;top:80px;background:#0b0b0b;color:#f1d78a;padding:10px;border-radius:10px;border:1px solid #222;z-index:999999";
    p.innerHTML = '<div style="font-weight:bold">GrepoFusion</div><div style="margin:6px 0"><button id=\"gf_open\">Nowy wÄ…tek (forum)</button> <button id=\"gf_csv\">Export CSV</button></div><div style="font-size:11px;color:#ccc">Export to CSV creates a snapshot file you can save.</div>';
    document.body.appendChild(p);
    document.getElementById("gf_open").onclick = ()=>{ const u = location.protocol+"//"+location.host+"/forum/index.php?mode=newtopic&f=alliance"; window.open(u, "_blank"); };
    document.getElementById("gf_csv").onclick = ()=>{
      const snap = { ts:new Date().toISOString(), url:location.href, title:document.title, nick:(window.game_data && game_data.player_name)?game_data.player_name:"" };
      const csv = "ts,url,title,nick\n" + [snap.ts,snap.url,snap.title,snap.nick].map(x=>'\"'+String(x).replace(/\"/g,'\"\"')+'\"').join(",") + "\n";
      const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="snapshot_"+(new Date().toISOString().slice(0,10))+".csv"; a.click();
    };
  }
  setTimeout(createPanel,1500);
})();
