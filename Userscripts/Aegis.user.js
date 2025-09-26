// ==UserScript==
// @name         Aegis — Grepolis Remaster (themes + UI polish)
// @namespace    https://github.com/KID6767/HeliosSuite
// @version      1.0.0
// @description  Złoto-czarny remaster UI + 4 motywy (Classic/Remaster/Piracki/Dark), ikony menu, kosmetyka okien
// @author       KID6767
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @exclude      https://forum*.grepolis.*/*
// @exclude      http://forum*.grepolis.*/*
// @run-at       document-end
// @downloadURL  https://raw.githubusercontent.com/KID6767/HeliosSuite/main/Userscripts/Aegis.user.js
// @updateURL    https://raw.githubusercontent.com/KID6767/HeliosSuite/main/Userscripts/Aegis.user.js
// ==/UserScript==
(function () {
  'use strict';

  const THEMES = {
    Classic: {
      '--aegis-bg': '#0f0f11',
      '--aegis-panel': '#15161a',
      '--aegis-acc': '#f7d774',
      '--aegis-acc-2': '#8a6b1f',
      '--aegis-text': '#eee',
    },
    Remaster: { // nowocześnie, czysto
      '--aegis-bg': '#0b0e12',
      '--aegis-panel': '#10151c',
      '--aegis-acc': '#ffd26a',
      '--aegis-acc-2': '#3aa0ff',
      '--aegis-text': '#f2f2f2',
    },
    Piracki: { // zielono-czarna „karaiby”
      '--aegis-bg': '#07100b',
      '--aegis-panel': '#0b1a11',
      '--aegis-acc': '#20c997',
      '--aegis-acc-2': '#1b7a5d',
      '--aegis-text': '#e8fff7',
    },
    Dark: { // night mode
      '--aegis-bg': '#090b10',
      '--aegis-panel': '#0f1218',
      '--aegis-acc': '#9aa0a6',
      '--aegis-acc-2': '#5f6368',
      '--aegis-text': '#e8eaed',
    }
  };

  const STORAGE_KEY = 'AegisTheme';
  const saved = localStorage.getItem(STORAGE_KEY) || 'Remaster';
  const activeTheme = THEMES[saved] ? saved : 'Remaster';

  function applyTheme(name) {
    const t = THEMES[name] || THEMES.Remaster;
    const root = document.documentElement;
    Object.entries(t).forEach(([k,v])=> root.style.setProperty(k,v));
    localStorage.setItem(STORAGE_KEY, name);
  }

  const baseCSS = `
  :root{
    --aegis-radius: 12px;
    --aegis-ring: 0 0 0 1px rgba(0,0,0,.25), 0 10px 25px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.03);
  }
  body, #ui_box, #ui_wrapper { background: var(--aegis-bg)!important; color: var(--aegis-text)!important; }
  .aegis-card{ background: var(--aegis-panel); border-radius: var(--aegis-radius); box-shadow: var(--aegis-ring); padding:10px; }
  .aegis-title{ color: var(--aegis-acc); letter-spacing:.5px; text-transform:uppercase; font-weight:700; }
  /* Ikony menu (zamiast kwadratów) */
  #toolbar, .nui_main_menu { backdrop-filter: blur(6px); background: linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.1)); }
  .nui_main_menu .item .icon{
    border-radius:10px!important; background: radial-gradient(ellipse at 30% 20%, var(--aegis-acc), transparent 60%);
    filter: drop-shadow(0 2px 8px rgba(0,0,0,.5));
  }
  /* Przyciski */
  .aegis-btn{ background: linear-gradient(180deg, var(--aegis-acc), var(--aegis-acc-2)); color:#111; border:none; padding:8px 12px; border-radius:10px; cursor:pointer; font-weight:700; }
  .aegis-btn:hover{ transform: translateY(-1px); filter: brightness(1.05); }
  /* Okna modalne (Senat, Agora, Raporty, Forum) – wygładzenie ramek */
  .gpwindow_content { background: var(--aegis-panel)!important; border-radius: var(--aegis-radius)!important; }
  .gpwindow .gpwindow_header, .gpwindow .gpwindow_footer { background: rgba(255,255,255,.02)!important; }
  `;

  const style = document.createElement('style');
  style.textContent = baseCSS;
  document.head.appendChild(style);
  applyTheme(activeTheme);

  // Mały panel wyboru motywu
  function mountThemeSwitcher(){
    if (document.getElementById('aegis-theme-switcher')) return;
    const wrap = document.createElement('div');
    wrap.id = 'aegis-theme-switcher';
    wrap.className = 'aegis-card';
    wrap.style.cssText = `
      position: fixed; right: 16px; bottom: 16px; z-index: 999999;
      min-width: 260px; border: 1px solid rgba(255,255,255,.05);
    `;
    wrap.innerHTML = `
      <div class="aegis-title" style="display:flex;justify-content:space-between;align-items:center;">
        <span>AEGIS • Motyw</span>
        <button class="aegis-btn" id="aegis-hide">X</button>
      </div>
      <div style="margin-top:8px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        ${Object.keys(THEMES).map(n=>`
          <button class="aegis-btn" data-theme="${n}" ${n===activeTheme?'style="outline:2px solid #fff"':''}>${n}</button>
        `).join('')}
      </div>
    `;
    document.body.appendChild(wrap);
    wrap.querySelector('#aegis-hide').onclick = ()=> wrap.remove();
    wrap.querySelectorAll('[data-theme]').forEach(btn=>{
      btn.onclick = ()=>{
        applyTheme(btn.dataset.theme);
        wrap.remove();
        setTimeout(mountThemeSwitcher,0);
      };
    });
  }

  // Pokaż po załadowaniu
  const ready = () => mountThemeSwitcher();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
