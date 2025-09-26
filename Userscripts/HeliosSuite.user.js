// ==UserScript==
// @name         HeliosSuite
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Zintegrowany pakiet Aegis + GrepoFusion + HeliosPulse dla Grepolis
// @author       kid6767 & GPT
// @match        https://*.grepolis.com/game/*
// @icon         https://i.imgur.com/AKW1G7F.png
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    /************************************
     * KONFIGURACJA GLOBALNA
     ************************************/
    const CONFIG = {
        WEBAPP_URL: "https://script.google.com/macros/s/AKfycbyHm1SuEMUyfeRUiU9ttQLyfaix1QacKaJhU0tGdB_YQb9ToaWHiRoYA55lPvkmIceq3w/exec",
        TOKEN: "HELIOS-ALPHA", // stały token
        STORAGE_KEY: "HeliosSuiteSettings"
    };

    /************************************
     * ZARZĄDZANIE USTAWIENIAMI
     ************************************/
    let settings = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || "{}");

    function saveSettings() {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(settings));
    }

    function getSetting(key, def) {
        return settings[key] !== undefined ? settings[key] : def;
    }

    function setSetting(key, value) {
        settings[key] = value;
        saveSettings();
    }

    /************************************
     * MOTYWY
     ************************************/
    function applyTheme(theme) {
        document.body.classList.remove("helios-classic", "helios-dark");
        if (theme === "Classic") document.body.classList.add("helios-classic");
        if (theme === "Dark") document.body.classList.add("helios-dark");
    }

    const style = document.createElement("style");
    style.textContent = `
      body.helios-dark {
        background: #0b0c10 !important;
        color: #eee !important;
      }
      body.helios-dark .ui_various {
        background: #1f2833 !important;
        color: #eee !important;
      }
      body.helios-classic {
        background: #f4f4f4 !important;
      }
    `;
    document.head.appendChild(style);

    /************************************
     * ZAKŁADKA W USTAWIENIACH
     ************************************/
    function injectSettingsTab() {
        if (!window.Game || !window.GPWindowMgr) return;

        const SettingsWindowFactory = window.SettingsWindowFactory;
        if (!SettingsWindowFactory) return;

        const origInit = SettingsWindowFactory.open;
        SettingsWindowFactory.open = function (tab, subtab) {
            const wnd = origInit.apply(this, arguments);

            if (wnd && !wnd.__helios_injected) {
                wnd.__helios_injected = true;
                const container = wnd.getHandler().getElement().find(".settings-container");

                const heliosTab = $(`
                  <div class="helios-tab">
                    <h2>⚡ HeliosSuite</h2>
                    <p>Wybierz motyw oraz dodatki do aktywacji:</p>

                    <label>
                      <strong>Motyw:</strong>
                      <select id="helios-theme">
                        <option value="Classic">Classic</option>
                        <option value="Dark">Dark</option>
                      </select>
                    </label>

                    <hr>

                    <h3>Aegis</h3>
                    <label><input type="checkbox" id="helios-aegis-queue"> Kolejka w Senacie</label><br>
                    <label><input type="checkbox" id="helios-aegis-ui"> Złoto-czarny UI</label>

                    <h3>GrepoFusion</h3>
                    <label><input type="checkbox" id="helios-gf-transport"> Transportrechner</label><br>
                    <label><input type="checkbox" id="helios-gf-time"> Zeitrechner</label><br>
                    <label><input type="checkbox" id="helios-gf-emotes"> Emotki w wiadomościach</label>

                    <h3>HeliosPulse</h3>
                    <label><input type="checkbox" id="helios-pulse-reports"> Raporty w UI</label><br>
                    <label><input type="checkbox" id="helios-pulse-presence"> Monitor obecności</label>
                  </div>
                `);

                container.append(heliosTab);

                // ustaw wartości z localStorage
                $("#helios-theme").val(getSetting("theme", "Classic"));
                applyTheme(getSetting("theme", "Classic"));

                $("#helios-aegis-queue").prop("checked", getSetting("aegisQueue", false));
                $("#helios-aegis-ui").prop("checked", getSetting("aegisUI", false));

                $("#helios-gf-transport").prop("checked", getSetting("gfTransport", false));
                $("#helios-gf-time").prop("checked", getSetting("gfTime", false));
                $("#helios-gf-emotes").prop("checked", getSetting("gfEmotes", false));

                $("#helios-pulse-reports").prop("checked", getSetting("pulseReports", false));
                $("#helios-pulse-presence").prop("checked", getSetting("pulsePresence", false));

                // reakcje na zmiany
                $("#helios-theme").on("change", function () {
                    setSetting("theme", this.value);
                    applyTheme(this.value);
                });

                $("#helios-aegis-queue").on("change", function () { setSetting("aegisQueue", this.checked); });
                $("#helios-aegis-ui").on("change", function () { setSetting("aegisUI", this.checked); });

                $("#helios-gf-transport").on("change", function () { setSetting("gfTransport", this.checked); });
                $("#helios-gf-time").on("change", function () { setSetting("gfTime", this.checked); });
                $("#helios-gf-emotes").on("change", function () { setSetting("gfEmotes", this.checked); });

                $("#helios-pulse-reports").on("change", function () { setSetting("pulseReports", this.checked); });
                $("#helios-pulse-presence").on("change", function () { setSetting("pulsePresence", this.checked); });
            }
            return wnd;
        };
    }

    /************************************
     * START
     ************************************/
    function init() {
        console.log("[HeliosSuite] Init");
        applyTheme(getSetting("theme", "Classic"));
        injectSettingsTab();
    }

    window.addEventListener("load", init);
})();