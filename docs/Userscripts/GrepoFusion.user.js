// ==UserScript==
// @name         GrepoFusion — Suite (Settings + Helpers)
// @namespace    https://github.com/KID6767/HeliosSuite
// @version      1.0.0
// @description  Panel ustawień a’la GCRT + wbudowane moduły (City Indexer, Transport calc, Time calc, Map highlight, Conquest counter, Attack range helper) — legalne helpery (bez autoklików).
// @author       KID6767
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @run-at       document-end
// @downloadURL  https://raw.githubusercontent.com/KID6767/HeliosSuite/main/Userscripts/GrepoFusion.user.js
// @updateURL    https://raw.githubusercontent.com/KID6767/HeliosSuite/main/Userscripts/GrepoFusion.user.js
// ==/UserScript==
(function(){
  'use strict';

  const LS_KEY = 'GF_SETTINGS';
  const DEFAULTS = {
    cityIndexer: true,
    transportCalc: true,
    timeCalc: true,
    mapEnhancer: true,
    conquestTally: true,
    attackRange: true
  };
  const st = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(LS_KEY)||'{}'));
  const save = ()=> localStorage.setItem(LS_KEY, JSON.stringify(st));

  function toggle(k){
    st[k] = !st[k]; save();
    notify(`GrepoFusion: ${k} = ${st[k]?'ON':'OFF'}`);
    renderSettings(); // odśwież
    bootModules();    // aktywuj/dezaktywuj
  }

  function notify(msg){
    const d=document.createElement('div');
    d.textContent=msg;
    d.style.cssText='position:fixed;top:12px;right:12px;background:#111;color:#ffd26a;padding:10px 14px;border-radius:10px;z-index:999999;box-shadow:0 8px 24px rgba(0,0,0,.4)';
    document.body.appendChild(d);
    setTimeout(()=>d.remove(),2500);
  }

  // Ikona w lewym menu
  function addSidebarIcon(){
    if (document.getElementById('gf-icon')) return;
    const btn = document.createElement('div');
    btn.id='gf-icon';
    btn.title='GrepoFusion — ustawienia';
    btn.style.cssText='position:fixed;left:10px;bottom:100px;width:40px;height:40px;border-radius:9px;background:radial-gradient(ellipse at 40% 30%, #ffd26a, transparent 60%);box-shadow:0 8px 18px rgba(0,0,0,.45);cursor:pointer;z-index:999999;';
    btn.onclick = openSettings;
    document.body.appendChild(btn);
  }

  function openSettings(){
    let w = document.getElementById('gf-panel');
    if (!w){
      w = document.createElement('div');
      w.id='gf-panel';
      w.style.cssText='position:fixed;right:16px;top:16px;width:340px;background:#0f1218;color:#eee;border-radius:12px;padding:12px;border:1px solid rgba(255,255,255,.06);box-shadow:0 10px 30px rgba(0,0,0,.45);z-index:999999';
      w.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="font-weight:800;letter-spacing:.5px;color:#ffd26a">GrepoFusion — konfiguracja</div>
        <button id="gf-close" style="background:#ffd26a;border:none;border-radius:8px;padding:6px 10px;color:#111;font-weight:800;cursor:pointer">X</button>
      </div>
      <div id="gf-body"></div>`;
      document.body.appendChild(w);
      w.querySelector('#gf-close').onclick = ()=> w.remove();
    }
    renderSettings();
  }

  function renderSettings(){
    const el = document.getElementById('gf-body');
    if (!el) return;
    el.innerHTML = `
      ${Object.keys(DEFAULTS).map(k=>`
      <label style="display:flex;align-items:center;gap:10px;margin:6px 0;">
        <input type="checkbox" data-k="${k}" ${st[k]?'checked':''}/>
        <span style="flex:1">${label(k)}</span>
      </label>
      `).join('')}
      <div style="margin-top:10px;opacity:.7;font-size:12px">Helpery nie wykonują akcji za gracza — dostarczają widoki, liczniki, obliczenia i mapowe podświetlenia.</div>
    `;
    el.querySelectorAll('input[type=checkbox]').forEach(chk=>{
      chk.onchange = ()=> toggle(chk.dataset.k);
    });
  }
  function label(k){
    return ({
      cityIndexer:'City Indexer (spis miast)',
      transportCalc:'Transport calculator (ładowność)',
      timeCalc:'Time calculator (czasy przelotów)',
      mapEnhancer:'Map Enhancer (podświetlenia/warstwy)',
      conquestTally:'Conquest Tally (liczniki podbić)',
      attackRange:'Attack Range helper (zasięg z miasta)'
    })[k]||k;
  }

  // Moduły (lightweight, bez autoklików)
  const Modules = {
    cityIndexer: {
      on(){
        if (document.getElementById('gf-city-indexer')) return;
        const w=document.createElement('div');
        w.id='gf-city-indexer';
        w.style.cssText='position:fixed;left:16px;top:16px;width:280px;max-height:40vh;overflow:auto;background:#0f1218;border-radius:12px;padding:10px;color:#eee;border:1px solid rgba(255,255,255,.06);box-shadow:0 8px 24px rgba(0,0,0,.45);z-index:999998';
        w.innerHTML='<div style="font-weight:800;color:#ffd26a;margin-bottom:6px">GrepoFusion — City Indexer</div><div id="gf-city-list">• Wykrywanie nazw Twoich miast…</div>';
        document.body.appendChild(w);
        // Minimalna próbka — pobierz listę z UI gry (jeśli dostępna)
        setTimeout(()=>{
          const listEl = document.querySelector('.city_list') || document.querySelector('#ui_box');
          const sample = Array.from(document.querySelectorAll('.town_name')).map(e=>e.textContent.trim()).filter(Boolean).slice(0,15);
          document.getElementById('gf-city-list').textContent = sample.length ? sample.join(', ') : 'Brak widocznej listy w DOM (pokazuję placeholder).';
        },1000);
      },
      off(){ document.getElementById('gf-city-indexer')?.remove(); }
    },
    transportCalc: {
      on(){
        if (document.getElementById('gf-transport')) return;
        const w=document.createElement('div');
        w.id='gf-transport';
        w.className='aegis-card';
        w.style.cssText='position:fixed;left:16px;bottom:16px;width:280px;z-index:999998';
        w.innerHTML = `
          <div style="font-weight:800;color:#ffd26a;margin-bottom:10px">Transport — ładowność</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <label>Mały transport<input id="gf-ts-s" type="number" value="0" style="width:100%"></label>
            <label>Duży transport<input id="gf-ts-l" type="number" value="0" style="width:100%"></label>
          </div>
          <div style="margin-top:8px">
            <button id="gf-ts-calc" class="aegis-btn">Oblicz</button>
            <span id="gf-ts-out" style="margin-left:8px;opacity:.85"></span>
          </div>`;
        document.body.appendChild(w);
        document.getElementById('gf-ts-calc').onclick = ()=>{
          const s = parseInt(document.getElementById('gf-ts-s').value||0,10);
          const l = parseInt(document.getElementById('gf-ts-l').value||0,10);
          // przybliżona ładowność: mały 10, duży 30 (przykład)
          const cap = s*10 + l*30;
          document.getElementById('gf-ts-out').textContent = `Ładowność: ${cap}`;
        };
      },
      off(){ document.getElementById('gf-transport')?.remove(); }
    },
    timeCalc: {
      on(){
        if (document.getElementById('gf-time')) return;
        const w=document.createElement('div');
        w.id='gf-time';
        w.className='aegis-card';
        w.style.cssText='position:fixed;right:16px;bottom:16px;width:300px;z-index:999998';
        w.innerHTML=`
          <div class="aegis-title" style="margin-bottom:10px">Czasy przelotów</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <label>Distance<input id="gf-dist" type="number" value="10" style="width:100%"></label>
            <label>Speed<input id="gf-speed" type="number" value="20" style="width:100%"></label>
          </div>
          <div style="margin-top:8px">
            <button id="gf-time-calc" class="aegis-btn">Oblicz</button>
            <span id="gf-time-out" style="margin-left:8px;opacity:.85"></span>
          </div>`;
        document.body.appendChild(w);
        document.getElementById('gf-time-calc').onclick=()=>{
          const d = parseFloat(document.getElementById('gf-dist').value||0);
          const s = parseFloat(document.getElementById('gf-speed').value||1);
          const t = s>0 ? (d/s) : 0;
          document.getElementById('gf-time-out').textContent = `~ ${t.toFixed(2)} h`;
        };
      },
      off(){ document.getElementById('gf-time')?.remove(); }
    },
    mapEnhancer: {
      on(){
        document.body.classList.add('gf-map-enh');
        const st = document.createElement('style');
        st.id='gf-map-css';
        st.textContent=`.gf-map-enh .island, .gf-map-enh .mini_map { filter: contrast(1.05) saturate(1.1) }`;
        document.head.appendChild(st);
      },
      off(){
        document.body.classList.remove('gf-map-enh');
        document.getElementById('gf-map-css')?.remove();
      }
    },
    conquestTally: {
      on(){
        if (document.getElementById('gf-conq')) return;
        const w=document.createElement('div');
        w.id='gf-conq';
        w.className='aegis-card';
        w.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:12px;width:max(280px,28vw);z-index:999998;text-align:center';
        w.innerHTML='<div class="aegis-title">Conquest Tally</div><div style="opacity:.85">Dzienny licznik podbić (placeholder)</div>';
        document.body.appendChild(w);
      },
      off(){ document.getElementById('gf-conq')?.remove(); }
    },
    attackRange: {
      on(){
        document.body.classList.add('gf-attackrange');
        const st=document.createElement('style'); st.id='gf-attackrange-css';
        st.textContent='.gf-attackrange .ocean { box-shadow: inset 0 0 0 2px rgba(255,210,106,.25) }';
        document.head.appendChild(st);
      },
      off(){
        document.body.classList.remove('gf-attackrange');
        document.getElementById('gf-attackrange-css')?.remove();
      }
    }
  };

  function bootModules(){
    Object.keys(Modules).forEach(k=>{
      try { st[k] ? Modules[k].on() : Modules[k].off(); } catch(e){}
    });
  }

  // Start
  const ready = ()=>{
    addSidebarIcon();
    bootModules();
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
