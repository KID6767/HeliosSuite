/* GrepoFusion – integracje, ustawienia, schowek na moduły z TM */
(() => {
  'use strict';

  // TODO: tu będziemy wpinać Twoje obecne mody z TM (Map Enhancer / Attack Range / Transport/Zeit Rechner / GRCt-proxy / GrepoChat-proxy)
  // Teraz: działający panel przełączników + hook do Ustawienia → Aplikacje/”Inne” (wstrzyknięty przy otwieraniu okna)

  const state = JSON.parse(localStorage.getItem('GF_state')||'{}');
  const DEF = {
    mapEnhancer: !!state.mapEnhancer,
    attackRange: !!state.attackRange,
    transportCalc: !!state.transportCalc,
    timeCalc: !!state.timeCalc,
    chatBridge: !!state.chatBridge,
  };
  function save(p){ localStorage.setItem('GF_state', JSON.stringify(p)); }

  // Panel wewnątrz HS
  window.addEventListener('HS:openPanel', ()=> openPanel());
  function openPanel(){
    const host = document.getElementById('hs-panel');
    if (!host || document.getElementById('gf-card')) return;
    const cfg = {...DEF, ...JSON.parse(localStorage.getItem('GF_state')||'{}')};

    const card = document.createElement('div');
    card.id='gf-card';
    card.className='hs-section';
    card.style.cssText='padding:12px 14px;border-top:1px solid var(--hs-border)';
    card.innerHTML = `
      <div style="font-weight:700;margin-bottom:8px">GrepoFusion – Integracje</div>
      <label style="display:flex;align-items:center;gap:8px;margin:6px 0"><input type="checkbox" data-k="mapEnhancer"> Map Enhancer</label>
      <label style="display:flex;align-items:center;gap:8px;margin:6px 0"><input type="checkbox" data-k="attackRange"> Attack Range Helper</label>
      <label style="display:flex;align-items:center;gap:8px;margin:6px 0"><input type="checkbox" data-k="transportCalc"> Transport Rechner</label>
      <label style="display:flex;align-items:center;gap:8px;margin:6px 0"><input type="checkbox" data-k="timeCalc"> Zeit Rechner</label>
      <label style="display:flex;align-items:center;gap:8px;margin:6px 0"><input type="checkbox" data-k="chatBridge"> Chat (bridge)</label>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button id="gf-save"  style="background:var(--hs-accent);color:#111;border:0;border-radius:8px;padding:6px 8px;font-weight:700">Zapisz</button>
        <button id="gf-apply" style="background:#2a251e;border:1px solid var(--hs-border);color:#f6e8b4;border-radius:8px;padding:6px 8px">Zastosuj</button>
      </div>
      <div class="muted" style="opacity:.8;font-size:12px;margin-top:6px">W następnym kroku dołączę wbudowane implementacje tych modułów, byś mógł wyłączyć oryginały w TM.</div>
    `;
    card.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = !!cfg[cb.dataset.k]; });
    card.querySelector('#gf-save').onclick = () => {
      const next = {...cfg};
      card.querySelectorAll('input[type=checkbox]').forEach(cb => next[cb.dataset.k] = cb.checked);
      save(next);
      alert('Zapisano ustawienia GrepoFusion');
    };
    card.querySelector('#gf-apply').onclick = () => {
      alert('Zastosowano – moduły zostaną przeładowane w kolejnych iteracjach (plan: wbudowane wersje).');
      // tutaj w kolejnych commitach: dynamiczny import odpowiednich modułów
    };
    host.appendChild(card);
  }

  // Pseudowstawka do okna “Ustawienia/Inne” – link do Panelu HS (na wzór DIO/GRCt)
  const obs = new MutationObserver(() => {
    if (document.getElementById('hs-mini-link')) return;
    const container = document.querySelector('.settings .list, .settings-list, .settings_menu, .content .list');
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.id='hs-mini-link';
    wrap.style.cssText='margin:10px 0 0;border-top:1px solid rgba(255,255,255,.12);padding-top:8px';
    wrap.innerHTML = `<a href="javascript:void(0)" style="background:#2a251e;border:1px solid var(--hs-border);color:#f6e8b4;border-radius:8px;padding:6px 8px">HeliosSuite – Panel</a>`;
    wrap.onclick = ()=> window.dispatchEvent(new CustomEvent('HS:openPanel',{detail:{from:'settings'}}));
    container.appendChild(wrap);
  });
  obs.observe(document.body, {subtree:true,childList:true});

})();
