// ==UserScript==
// @name         HeliosSuite (TEMP MONO) — Aegis + GrepoFusion + HeliosPulse
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.0
// @description  Zakładka "HeliosSuite" w Ustawieniach + motywy (Aegis) + integracje (GrepoFusion/HeliosPulse) + poprawki UI
// @author       HeliosSuite
// @match        https://*.grepolis.com/*
// @match        http://*.grepolis.com/*
// @exclude      https://forum*.grepolis.*
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  /* =========================
   *  STAŁE / KONFIG
   * ========================= */
  const CONFIG = {
    WEBAPP_URL: "https://script.google.com/macros/s/AKfycbyHm1SuEMUyfeRUiU9ttQLyfaix1QacKaJhU0tGdB_YQb9ToaWHiRoYA55lPvkmIceq3w/exec",
    TOKEN: "HeliosPulseToken",
    STORAGE_KEY: "heliosuite.settings.v1",
    LOG_PREFIX: "[HeliosSuite]"
  };

  const DEFAULTS = {
    aegis: {
      theme: "Classic",       // Classic | Remaster | Piracki | Dark
      dayNight: "auto",       // auto | day | night
      uiFixes: true,
      widePopups: true
    },
    grepoFusion: {
      enabled: true,
      cityIndexer: true,
      mapLayers: true,
      exportCSV: true
    },
    heliosPulse: {
      enabled: true,
      presencePing: true,
      dailyReport: false,     // tylko w UI, trigger ręczny
      bbcodeLang: "pl"
    }
  };

  /* =========================
   *  POMOCNICZE
   * ========================= */
  const log = (...args) => console.log(CONFIG.LOG_PREFIX, ...args);

  function loadSettings() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULTS);
      const parsed = JSON.parse(raw);
      // merge z domyślnymi (bezpiecznie przy aktualizacjach)
      return deepMerge(structuredClone(DEFAULTS), parsed);
    } catch (e) {
      console.warn(CONFIG.LOG_PREFIX, "loadSettings error", e);
      return structuredClone(DEFAULTS);
    }
  }

  function saveSettings(s) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(s));
  }

  function deepMerge(target, src) {
    for (const k of Object.keys(src)) {
      if (src[k] && typeof src[k] === "object" && !Array.isArray(src[k])) {
        if (!target[k]) target[k] = {};
        deepMerge(target[k], src[k]);
      } else target[k] = src[k];
    }
    return target;
  }

  function waitFor(condFn, timeoutMs = 20000, interval = 100) {
    return new Promise((resolve, reject) => {
      const t0 = Date.now();
      const timer = setInterval(() => {
        try {
          if (condFn()) {
            clearInterval(timer);
            resolve(true);
          } else if (Date.now() - t0 > timeoutMs) {
            clearInterval(timer);
            reject(new Error("waitFor timeout"));
          }
        } catch (e) {
          clearInterval(timer);
          reject(e);
        }
      }, interval);
    });
  }

  /* =========================
   *  THEME MANAGER (Aegis)
   * ========================= */
  const ThemeManager = (() => {
    const root = document.documentElement;
    const BODY_CLASS_BASE = "hs-aegis";
    const THEME_CLASS = {
      Classic: "hs-theme-classic",
      Remaster: "hs-theme-remaster",
      Piracki: "hs-theme-piracki",
      Dark: "hs-theme-dark"
    };

    function apply(settings) {
      // bazowa klasa
      root.classList.add(BODY_CLASS_BASE);
      // motywy — usuń wszystkie i ustaw bieżący
      Object.values(THEME_CLASS).forEach(c => root.classList.remove(c));
      root.classList.add(THEME_CLASS[settings.aegis.theme] || THEME_CLASS.Classic);

      // dzienny/nocny
      root.classList.remove("hs-night", "hs-day");
      const mode = computeDayNight(settings.aegis.dayNight);
      root.classList.add(mode === "night" ? "hs-night" : "hs-day");

      // poprawki UI
      toggleCssFlag("hs-ui-fixes", !!settings.aegis.uiFixes);
      toggleCssFlag("hs-wide-popups", !!settings.aegis.widePopups);
    }

    function computeDayNight(mode) {
      if (mode === "day") return "day";
      if (mode === "night") return "night";
      // auto: noc między 20:00 a 6:00
      const h = new Date().getHours();
      return (h >= 20 || h < 6) ? "night" : "day";
    }

    function toggleCssFlag(cls, on) {
      (on ? root.classList.add(cls) : root.classList.remove(cls));
    }

    return { apply };
  })();

  /* =========================
   *  HELIOSPULSE API (opcjonalnie)
   * ========================= */
  const HP = (() => {
    function pingPresence(nick = getNick()) {
      if (!CONFIG.WEBAPP_URL) return;
      const url = `${CONFIG.WEBAPP_URL}?action=presence&token=${encodeURIComponent(CONFIG.TOKEN)}&nick=${encodeURIComponent(nick)}&ts=${Date.now()}`;
      GM_xmlhttpRequest({ method: "GET", url, onload: () => log("presence OK"), onerror: e => console.warn(CONFIG.LOG_PREFIX, "presence ERR", e) });
    }
    function getNick() {
      try {
        if (window.game_data?.player_name) return window.game_data.player_name;
      } catch {}
      return "Unknown";
    }
    return { pingPresence, getNick };
  })();

  /* =========================
   *  UI: WSTRZYKNIĘCIE ZAKŁADKI
   * ========================= */
  const UI = (() => {
    let state = loadSettings();

    // główny trigger: hak na okno Ustawień
    async function hookSettingsWindow() {
      // Czekamy aż pojawi się GP okno ustawień (po kliknięciu koła zębatego)
      // Będziemy też nasłuchiwać na zmiany DOM (gdy user otworzy ustawienia)
      const obs = new MutationObserver(injectIfSettingsOpen);
      obs.observe(document.body, { childList: true, subtree: true });
      // spróbuj od razu
      injectIfSettingsOpen();
    }

    function isSettingsWindow(node) {
      if (!node) return false;
      // Grepolis: okna mają .gpwindow_content; tytuł zawiera "Ustawienia" (pl) lub "Settings" (en)
      try {
        const title = node.querySelector(".gpwindow_header .gpwindow_title")?.textContent?.trim().toLowerCase();
        return !!(node.querySelector(".gpwindow_content") && title && (title.includes("ustawienia") || title.includes("settings")));
      } catch { return false; }
    }

    function injectIfSettingsOpen() {
      document.querySelectorAll(".gpwindow_content").forEach(win => {
        if (!isSettingsWindow(win)) return;
        const tabsBar = win.querySelector(".settings-menu, .ui_tabs, .tabbar, .gp_tabbar") || win.querySelector(".settings_tabs");
        const contentArea = win.querySelector(".gpwindow_content"); // główny kontener
        if (!tabsBar || !contentArea) return;

        // uniknij duplikatu
        if (tabsBar.querySelector(".hs-tab-button")) return;

        // 1) przycisk zakładki
        const btn = document.createElement("div");
        btn.className = "hs-tab-button ui_tab"; // dopasowane do stylu gry
        btn.textContent = "HeliosSuite";
        btn.title = "Motywy + integracje (Aegis / GrepoFusion / HeliosPulse)";
        btn.addEventListener("click", () => showHS(contentArea, tabsBar, btn));
        tabsBar.appendChild(btn);

        // jeżeli chcesz auto-otwarcie po wejściu w ustawienia, odkomentuj:
        // showHS(contentArea, tabsBar, btn);
      });
    }

    function showHS(contentArea, tabsBar, btn) {
      // dezaktywuj inne taby
      tabsBar.querySelectorAll(".ui_tab, .tab, .selected").forEach(el => el.classList.remove("selected"));
      btn.classList.add("selected");

      // główny panel
      contentArea.innerHTML = "";
      const wrap = document.createElement("div");
      wrap.className = "hs-pane";
      wrap.innerHTML = renderPane();
      contentArea.appendChild(wrap);

      bindEvents(wrap);
    }

    function renderPane() {
      const s = state;
      return `
        <div class="hs-pane-header">
          <div class="hs-logo">HeliosSuite</div>
          <div class="hs-sub">Aegis • GrepoFusion • HeliosPulse</div>
        </div>

        <div class="hs-tabs">
          <button class="hs-tab hs-tab--active" data-tab="aegis">Aegis (motywy)</button>
          <button class="hs-tab" data-tab="fusion">GrepoFusion</button>
          <button class="hs-tab" data-tab="pulse">HeliosPulse</button>
        </div>

        <div class="hs-tabview">
          <!-- AEGIS -->
          <section class="hs-section" data-view="aegis" style="display:block">
            <h3>Motyw i wygląd</h3>
            <label class="hs-row">
              <span>Motyw:</span>
              <select id="hs-aegis-theme">
                ${["Classic","Remaster","Piracki","Dark"].map(v => `<option value="${v}" ${s.aegis.theme===v?"selected":""}>${v}</option>`).join("")}
              </select>
            </label>

            <label class="hs-row">
              <span>Tryb dobowy:</span>
              <select id="hs-aegis-daynight">
                ${[
                  ["auto","Auto (noc 20:00–6:00)"],
                  ["day","Dzienny"],
                  ["night","Nocny"]
                ].map(([val,txt]) => `<option value="${val}" ${s.aegis.dayNight===val?"selected":""}>${txt}</option>`).join("")}
              </select>
            </label>

            <label class="hs-row">
              <span>Poprawki UI (warstwy/z-index/kontrast):</span>
              <input type="checkbox" id="hs-aegis-uifixes" ${s.aegis.uiFixes?"checked":""}/>
            </label>

            <label class="hs-row">
              <span>Szerokie okna/raporty:</span>
              <input type="checkbox" id="hs-aegis-wide" ${s.aegis.widePopups?"checked":""}/>
            </label>

            <div class="hs-actions">
              <button class="hs-btn" id="hs-aegis-apply">Zastosuj motyw</button>
            </div>
          </section>

          <!-- GREPOFUSION -->
          <section class="hs-section" data-view="fusion">
            <h3>GrepoFusion</h3>
            <label class="hs-row">
              <span>Włącz GrepoFusion:</span>
              <input type="checkbox" id="hs-gf-enabled" ${s.grepoFusion.enabled?"checked":""}/>
            </label>

            <label class="hs-row">
              <span>City Indexer:</span>
              <input type="checkbox" id="hs-gf-indexer" ${s.grepoFusion.cityIndexer?"checked":""}/>
            </label>

            <label class="hs-row">
              <span>Warstwy/Podświetlenia mapy:</span>
              <input type="checkbox" id="hs-gf-layers" ${s.grepoFusion.mapLayers?"checked":""}/>
            </label>

            <label class="hs-row">
              <span>Eksport CSV:</span>
              <input type="checkbox" id="hs-gf-csv" ${s.grepoFusion.exportCSV?"checked":""}/>
            </label>

            <div class="hs-note">* Integracja jest przygotowana – faktyczne moduły GF odpalimy/wyłączymy wg tych przełączników.</div>
          </section>

          <!-- HELIOSPULSE -->
          <section class="hs-section" data-view="pulse">
            <h3>HeliosPulse</h3>
            <label class="hs-row">
              <span>Włącz HeliosPulse:</span>
              <input type="checkbox" id="hs-hp-enabled" ${s.heliosPulse.enabled?"checked":""}/>
            </label>

            <label class="hs-row">
              <span>Ping obecności (ręczny):</span>
              <input type="checkbox" id="hs-hp-presence" ${s.heliosPulse.presencePing?"checked":""}/>
              <button class="hs-btn" id="hs-hp-ping-now">Wyślij ping teraz</button>
            </label>

            <label class="hs-row">
              <span>Język BBCode raportu:</span>
              <select id="hs-hp-bblang">
                ${["pl","en","de"].map(v => `<option value="${v}" ${s.heliosPulse.bbcodeLang===v?"selected":""}>${v}</option>`).join("")}
              </select>
            </label>

            <div class="hs-note">* WebApp: używam Twojego URL + tokenu. Ping nie wykonuje akcji w grze – tylko loguje obecność.</div>
          </section>
        </div>

        <div class="hs-footer">
          <button class="hs-btn hs-primary" id="hs-save">Zapisz</button>
          <button class="hs-btn" id="hs-cancel">Anuluj</button>
        </div>
      `;
    }

    function bindEvents(root) {
      // przełączniki kart
      root.querySelectorAll(".hs-tab").forEach(btn => {
        btn.addEventListener("click", () => {
          root.querySelectorAll(".hs-tab").forEach(b => b.classList.remove("hs-tab--active"));
          btn.classList.add("hs-tab--active");
          const view = btn.dataset.tab;
          root.querySelectorAll(".hs-section").forEach(sec => {
            sec.style.display = (sec.dataset.view === view) ? "block" : "none";
          });
        });
      });

      // Aegis apply
      root.querySelector("#hs-aegis-apply").addEventListener("click", () => {
        collectAndApply(root);
      });

      // Ping HP
      root.querySelector("#hs-hp-ping-now").addEventListener("click", () => {
        const s = collect(root);
        if (s.heliosPulse.enabled && s.heliosPulse.presencePing) {
          HP.pingPresence(HP.getNick());
        } else {
          alert("HeliosPulse lub ping obecności są wyłączone.");
        }
      });

      // Zapis / Anuluj
      root.querySelector("#hs-save").addEventListener("click", () => {
        const s = collect(root);
        state = s;
        saveSettings(state);
        ThemeManager.apply(state);
        alert("Zapisano ustawienia HeliosSuite.");
      });
      root.querySelector("#hs-cancel").addEventListener("click", () => {
        showToast("Anulowano — bez zmian.");
      });
    }

    function collect(root) {
      const s = structuredClone(state);
      // Aegis
      s.aegis.theme = root.querySelector("#hs-aegis-theme").value;
      s.aegis.dayNight = root.querySelector("#hs-aegis-daynight").value;
      s.aegis.uiFixes = root.querySelector("#hs-aegis-uifixes").checked;
      s.aegis.widePopups = root.querySelector("#hs-aegis-wide").checked;

      // GF
      s.grepoFusion.enabled = root.querySelector("#hs-gf-enabled").checked;
      s.grepoFusion.cityIndexer = root.querySelector("#hs-gf-indexer").checked;
      s.grepoFusion.mapLayers = root.querySelector("#hs-gf-layers").checked;
      s.grepoFusion.exportCSV = root.querySelector("#hs-gf-csv").checked;

      // HP
      s.heliosPulse.enabled = root.querySelector("#hs-hp-enabled").checked;
      s.heliosPulse.presencePing = root.querySelector("#hs-hp-presence").checked;
      s.heliosPulse.bbcodeLang = root.querySelector("#hs-hp-bblang").value;

      return s;
    }

    function collectAndApply(root) {
      const s = collect(root);
      ThemeManager.apply(s);
      showToast("Zastosowano motyw.");
    }

    return { hookSettingsWindow, applyOnLoad: () => ThemeManager.apply(state) };
  })();

  /* =========================
   *  CSS (motywy + poprawki UI)
   * ========================= */
  const STYLE = `
  /* ——— Podstawa ——— */
  :root.hs-aegis { }
  .hs-aegis .hs-hidden { display:none !important; }

  /* ——— Motywy (body/html classes) ——— */
  .hs-theme-classic {}
  .hs-theme-remaster {}
  .hs-theme-piracki {}
  .hs-theme-dark { filter: hue-rotate(0deg); }

  /* Dzień/noc – delikatny balans kolorów */
  .hs-day {}
  .hs-night body, .hs-night .gpwindow_content {
    filter: brightness(0.93) contrast(1.02);
  }

  /* ——— UI Fixes ——— */
  .hs-ui-fixes .gpwindow { z-index: 100000 !important; }
  .hs-ui-fixes .gpwindow .gpwindow_header { position: relative; z-index: 2; }
  .hs-ui-fixes .gpwindow_content { position: relative; z-index: 1; }
  .hs-wide-popups .gpwindow_content { max-width: 1200px !important; }

  /* ——— Panel HeliosSuite ——— */
  .hs-pane { padding: 12px; color: #ddd; background: rgba(10,14,22,0.75); border: 1px solid #223; border-radius: 6px; }
  .hs-pane .hs-pane-header { display:flex; align-items:baseline; gap:8px; margin-bottom:8px; }
  .hs-pane .hs-logo { font-size: 18px; font-weight: 700; letter-spacing: .5px; }
  .hs-pane .hs-sub { opacity: .8; }

  .hs-tabs { display:flex; gap:8px; margin: 10px 0; }
  .hs-tab { padding:6px 10px; background:#223; border:1px solid #334; color:#cfd8ff; cursor:pointer; border-radius:4px; }
  .hs-tab--active { background:#2f3b66; border-color:#4b5ea6; }

  .hs-section { background: rgba(0,0,0,.25); border:1px solid #233; border-radius:6px; padding:10px; }
  .hs-section h3 { margin: 0 0 8px 0; color:#fff; }
  .hs-row { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:6px 0; }
  .hs-row span { opacity:.95; }
  .hs-actions { margin-top:8px; }

  .hs-btn { padding:6px 10px; border:1px solid #47587a; background:#2c3650; color:#fff; border-radius:4px; cursor:pointer; }
  .hs-btn:hover { filter: brightness(1.08); }
  .hs-primary { background:#3d5afe; border-color:#3148c9; }

  .hs-footer { display:flex; gap:8px; justify-content:flex-end; margin-top:10px; }
  .hs-note { margin-top:8px; font-size:12px; opacity:.85; }

  /* checkbox/select wygląd bliżej Grepolis */
  .hs-pane input[type="checkbox"] { transform: scale(1.1); }
  .hs-pane select { min-width: 220px; }

  /* Ujednolicenie teł okien (zwłaszcza Settings/Reports) */
  .hs-ui-fixes .ui_tabs, .hs-ui-fixes .tabbar, .hs-ui-fixes .settings-menu { background: linear-gradient(#1a2233,#0f1522) !important; }
  .hs-ui-fixes .report_wrapper, .hs-ui-fixes .gpwindow_content .content { background: rgba(12,16,24,.92) !important; }

  `;

  function injectStyle(css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function showToast(msg) {
    try {
      const d = document.createElement("div");
      d.textContent = msg;
      d.style.cssText = "position:fixed;bottom:16px;left:16px;z-index:100001;background:#2c3650;color:#fff;padding:8px 10px;border:1px solid #47587a;border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,.35);";
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 2200);
    } catch {}
  }

  /* =========================
   *  START
   * ========================= */
  (async function init() {
    injectStyle(STYLE);
    // natychmiast zastosuj ostatnie ustawienia (motyw/naprawy)
    UI.applyOnLoad();

    // czekamy na strukturę okien GP i podpinamy hak
    try {
      await waitFor(() => document.querySelector(".ui_tabs, .settings-menu, .gpwindow"));
    } catch {}
    UI.hookSettingsWindow();

    log("ready");
  })();

})();
