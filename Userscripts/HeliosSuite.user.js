// ==UserScript==
// @name         HeliosSuite
// @namespace    https://kid6767.github.io/HeliosSuite/
// @version      1.0.0
// @description  Zintegrowany pakiet: Aegis + GrepoFusion + HeliosPulse
// @author       kid6767
// @match        https://*.grepolis.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  /****************
   * KONFIGURACJA
   ****************/
  const CONFIG = {
    WEBAPP_URL: "https://script.google.com/macros/s/AKfycbyHm1SuEMUyfeRUiU9ttQLyfaix1QacKaJhU0tGdB_YQb9ToaWHiRoYA55lPvkmIceq3w/exec",
    TOKEN: "HELIOSTOKEN2025"
  };

  /****************
   * THEME MANAGER
   ****************/
  const ThemeManager = {
    themes: {
      classic: { name: "Classic", css: "" },
      remaster: { name: "Remaster", css: "body { filter: saturate(1.2); }" },
      pirate: { name: "Piracki", css: "body { background-image: url('https://i.imgur.com/pirate.jpg'); }" },
      dark: { name: "Dark", css: "body { background: #111; color: #ddd; } .gpwindow { background:#222!important; }" },
      night: { name: "Night", css: "body { background: #000; color: #aaa; } .gpwindow { background:#111!important; }" }
    },
    current: localStorage.getItem("helios_theme") || "classic",
    apply(themeKey) {
      if (!this.themes[themeKey]) return;
      this.remove();
      const style = document.createElement("style");
      style.id = "helios-theme";
      style.innerHTML = this.themes[themeKey].css;
      document.head.appendChild(style);
      this.current = themeKey;
      localStorage.setItem("helios_theme", themeKey);
    },
    remove() {
      const old = document.getElementById("helios-theme");
      if (old) old.remove();
    }
  };
  ThemeManager.apply(ThemeManager.current);

  /****************
   * SETTINGS UI
   ****************/
  const HeliosSettings = {
    config: JSON.parse(localStorage.getItem("helios_config") || "{}"),

    save() {
      localStorage.setItem("helios_config", JSON.stringify(this.config));
    },

    initTab() {
      const tabId = "helios_tab";
      if ($("#" + tabId).length) return;

      const $menu = $(".settings-menu");
      if ($menu.length) {
        $menu.append(`<li id="${tabId}"><a href="#">⚡ HeliosSuite</a></li>`);
      }

      $("#helios_tab").on("click", () => {
        this.openSettingsWindow();
      });
    },

    openSettingsWindow() {
      const html = `
        <div class="helios-settings">
          <h2>⚡ HeliosSuite – Ustawienia</h2>

          <h3>Motyw</h3>
          <select id="helios_theme_select">
            ${Object.keys(ThemeManager.themes)
              .map(k => `<option value="${k}" ${k===ThemeManager.current?"selected":""}>${ThemeManager.themes[k].name}</option>`)
              .join("")}
          </select>

          <h3>Moduły</h3>
          <label><input type="checkbox" id="helios_aegis" ${this.config.aegis?"checked":""}> Aegis</label><br>
          <label><input type="checkbox" id="helios_grepofusion" ${this.config.grepofusion?"checked":""}> GrepoFusion</label><br>
          <label><input type="checkbox" id="helios_pulse" ${this.config.pulse?"checked":""}> HeliosPulse</label>

          <h3>Eksperymentalne</h3>
          <label><input type="checkbox" id="helios_darkmode" ${this.config.darkmode?"checked":""}> Tryb nocny</label>
        </div>
      `;

      const win = GPWindowMgr.Create(GPWindowMgr.TYPE_MESSAGE, "HeliosSuite", null);
      const $w = $(win.getJQElement());
      $w.find(".gpwindow_content").html(html);

      $("#helios_theme_select").on("change", e => {
        ThemeManager.apply(e.target.value);
      });

      $("#helios_aegis,#helios_grepofusion,#helios_pulse,#helios_darkmode").on("change", e => {
        this.config.aegis = $("#helios_aegis").is(":checked");
        this.config.grepofusion = $("#helios_grepofusion").is(":checked");
        this.config.pulse = $("#helios_pulse").is(":checked");
        this.config.darkmode = $("#helios_darkmode").is(":checked");
        this.save();
      });
    }
  };

  /****************
   * MODULES
   ****************/
  const Modules = {
    init() {
      if (HeliosSettings.config.aegis) this.aegis();
      if (HeliosSettings.config.grepofusion) this.grepofusion();
      if (HeliosSettings.config.pulse) this.pulse();
    },

    aegis() {
      console.log("[Aegis] aktywny");
      // TODO: pełne UI Senatu/Agory na złoto-czarno
    },

    grepofusion() {
      console.log("[GrepoFusion] aktywny");
      // TODO: zintegrowane moduły (Map Enhancer, Zeitrechner, City Indexer...)
    },

    pulse() {
      console.log("[HeliosPulse] aktywny");
      // TODO: raporty w UI gry
    }
  };

  /****************
   * INIT
   ****************/
  function init() {
    console.log("[HeliosSuite] start");
    HeliosSettings.initTab();
    Modules.init();
  }

  $(document).ready(init);

})();