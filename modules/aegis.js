/* AEGIS – motywy i naprawy UI */
(() => {
  'use strict';
  const CORE = window.HeliosSuiteCore?.getConfig?.() || {};
  const API  = window.HeliosSuiteCore;

  const css = `
  /* Pergaminy, okna, nakładki */
  .gpwindow,.ui-dialog,.gp_overlay,.gpreport_content,.ui-dialog .ui-dialog-content{
    background: var(--hs-panel)!important; color: var(--hs-text)!important;
  }
  .gpwindow .gpwindow_content,.ui-dialog .ui-dialog-content{ background: rgba(20,24,30,.92)!important; }
  .gpwindow .gpwindow_header,.ui-dialog .ui-dialog-titlebar{
    background: linear-gradient(#2a251e,#1f1b16)!important; color: var(--hs-text)!important; border-bottom:1px solid var(--hs-border)!important;
  }
  /* z-index naprawa (okna nie chowają się pod headerem) */
  .game_header,.game_footer{ z-index: 2100 !important; }
  .gpwindow,.gpwindow_content{ z-index: 2200 !important; }
  .ui-dialog,.ui-widget-overlay{ z-index: 3000 !important; }
  `;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  // Mały panelik w prawym górnym rogu – wybór motywu
  function palette(){
    if (document.getElementById('hs-palette')) return;
    const box = document.createElement('div');
    box.id = 'hs-palette';
    box.style.cssText = 'position:fixed;right:112px;top:8px;z-index:99999;display:flex;gap:6px';
    box.innerHTML = `
      <button data-th="goldblack" title="Gold/Black" style="width:22px;height:22px;border-radius:6px;border:1px solid #6d5a2f;background:#1f1b16"></button>
      <button data-th="dark"      title="Dark"       style="width:22px;height:22px;border-radius:6px;border:1px solid #2a3a53;background:#10131a"></button>
      <button data-th="classic"   title="Classic"    style="width:22px;height:22px;border-radius:6px;border:1px solid #3a3a3a;background:#202020"></button>
    `;
    box.addEventListener('click', (e)=>{
      const th = e.target?.dataset?.th; if (!th) return;
      API?.setTheme?.(th);
    });
    document.body.appendChild(box);
  }
  palette();

  // Reakcja na “otwórz panel” – Aegis dorzuca swoją zakładkę
  window.addEventListener('HS:openPanel', ()=> openPanel());

  function openPanel(){
    let host = document.getElementById('hs-panel');
    if (host) { host.remove(); }
    host = document.createElement('div');
    host.id = 'hs-panel';
    host.style.cssText = 'position:fixed;right:16px;top:52px;width:420px;max-height:80vh;overflow:auto;z-index:99998;border-radius:14px;border:1px solid var(--hs-border);background:var(--hs-panel);color:var(--hs-text);box-shadow:0 16px 40px rgba(0,0,0,.6)';
    host.innerHTML = `
      <header style="padding:12px 14px;border-bottom:1px solid var(--hs-border);display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:800;letter-spacing:.6px;color:var(--hs-accent)">HeliosSuite – Panel</div>
        <button id="hs-close" style="background:#2a251e;border:1px solid var(--hs-border);color:#f6e8b4;border-radius:8px;padding:6px 8px">✕</button>
      </header>
      <div class="hs-section" style="padding:12px 14px">
        <div style="font-weight:700;margin-bottom:8px">Motywy (Aegis)</div>
        <div style="display:flex;gap:8px">
          <button data-theme="goldblack" style="background:#1f1b16;border:1px solid #6d5a2f;color:#ffd257;border-radius:8px;padding:6px 8px">Gold/Black</button>
          <button data-theme="dark"      style="background:#10131a;border:1px solid #2a3a53;color:#7ed0ff;border-radius:8px;padding:6px 8px">Dark</button>
          <button data-theme="classic"   style="background:#202020;border:1px solid #3a3a3a;color:#f0f0f0;border-radius:8px;padding:6px 8px">Classic</button>
        </div>
      </div>
    `;
    host.querySelector('#hs-close').onclick = ()=> host.remove();
    host.querySelector('.hs-section').addEventListener('click',(e)=>{
      const th=e.target?.dataset?.theme; if(!th) return; API?.setTheme?.(th);
    });
    document.body.appendChild(host);
  }
})();
