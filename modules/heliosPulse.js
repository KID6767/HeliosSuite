/* HeliosPulse – obecność + szybkie raporty (GAS) */
(() => {
  'use strict';
  const CORE = window.HeliosSuiteCore?.getConfig?.() || {};
  const WEBAPP_URL = CORE.WEBAPP_URL;
  const TOKEN      = CORE.TOKEN;

  function tryNick(){
    try{
      const el = document.querySelector('.ui_player_name');
      if (el && el.textContent.trim()) return el.textContent.trim();
    }catch(_){}
    return 'Unknown';
  }

  async function pingPresence(){
    if (!WEBAPP_URL || !TOKEN) { alert('Brak WEBAPP_URL/TOKEN'); return; }
    try{
      const res = await fetch(WEBAPP_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token:TOKEN, action:'presence', nick: tryNick(), ts: new Date().toISOString() })
      });
      const text = await res.text();
      alert(`Presence: ${res.status}\n${text}`);
    }catch(e){ alert('Błąd: '+e.message); }
  }

  async function dailyJSON(){
    if (!WEBAPP_URL || !TOKEN) { alert('Brak WEBAPP_URL/TOKEN'); return; }
    try{
      const payload = {
        world: (window.Game && Game.world_id) || 'unknown',
        player: (window.Game && Game.player_name) || tryNick(),
        ts: new Date().toISOString()
      };
      const res = await fetch(WEBAPP_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token:TOKEN, action:'daily_report_json', data: payload })
      });
      const text=await res.text();
      alert(`Raport dzienny(JSON): ${res.status}\n${text}`);
    }catch(e){ alert('Błąd: '+e.message); }
  }

  function dock(){
    if (document.getElementById('hp-dock')) return;
    const box = document.createElement('div');
    box.id = 'hp-dock';
    box.style.cssText = 'position:fixed;left:18px;bottom:18px;z-index:99998;display:flex;gap:8px;flex-direction:column';
    box.innerHTML = `
      <div class="card" style="min-width:280px;background:var(--hs-panel);border:1px solid var(--hs-border);border-radius:10px;padding:10px 12px;color:var(--hs-text);box-shadow:0 10px 22px rgba(0,0,0,.4)">
        <div style="font-weight:700;margin-bottom:6px">HeliosPulse</div>
        <div style="display:flex;gap:8px">
          <button data-act="ping"  style="background:var(--hs-accent);color:#111;border:0;border-radius:8px;padding:6px 8px;font-weight:700">Zapisz obecność</button>
          <button data-act="daily" style="background:#2a251e;border:1px solid var(--hs-border);color:#f6e8b4;border-radius:8px;padding:6px 8px">Raport JSON</button>
        </div>
      </div>
    `;
    box.addEventListener('click',(e)=>{
      const a=e.target?.dataset?.act;
      if (a==='ping')  pingPresence();
      if (a==='daily') dailyJSON();
    });
    document.body.appendChild(box);
  }

  dock();

  // Panel: własna karta w oknie HS
  window.addEventListener('HS:openPanel', ()=> openPanel());
  function openPanel(){
    const host = document.getElementById('hs-panel');
    if (!host) return; // panel otwierany przez Aegis – my tylko dorzucamy sekcję
    if (document.getElementById('hp-card')) return;

    const card = document.createElement('div');
    card.id='hp-card';
    card.className='hs-section';
    card.style.cssText='padding:12px 14px;border-top:1px solid var(--hs-border)';
    card.innerHTML = `
      <div style="font-weight:700;margin-bottom:8px">Raporty & obecność (HeliosPulse)</div>
      <div style="display:flex;gap:8px;margin-bottom:6px">
        <button data-act="ping"  style="background:var(--hs-accent);color:#111;border:0;border-radius:8px;padding:6px 8px;font-weight:700">Zapisz obecność</button>
        <button data-act="daily" style="background:#2a251e;border:1px solid var(--hs-border);color:#f6e8b4;border-radius:8px;padding:6px 8px">Raport JSON</button>
      </div>
      <div class="muted" style="opacity:.8;font-size:12px">
        WEBAPP: ${WEBAPP_URL ? `<code>${WEBAPP_URL}</code>` : '<i>brak</i>'}<br>
        TOKEN: <code>${TOKEN}</code>
      </div>
    `;
    card.addEventListener('click',(e)=>{
      const a=e.target?.dataset?.act;
      if (a==='ping')  pingPresence();
      if (a==='daily') dailyJSON();
    });
    host.appendChild(card);
  }
})();
