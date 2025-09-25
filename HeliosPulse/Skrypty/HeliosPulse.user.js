// ==UserScript==
// @name         Helios Pulse - Presence & Stats
// @namespace    https://legionisci-heliosa.local
// @version      1.0
// @description  Potwierdzanie obecnosc + integracja z Google Sheets
// @match        https://*.grepolis.com/*
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function() {
  const CONFIG = {
    "ALLIANCE": "Legionisci Heliosa",
    "WEBAPP_URL": "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
    "TOKEN": "HeliosPulseToken"
  };

  function markPresence() {
    const url = CONFIG.WEBAPP_URL + "?token=" + CONFIG.TOKEN +
      "&nick=" + encodeURIComponent(window.Game?.player_name || "Unknown") +
      "&action=presence";
    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      onload: r => console.log("Presence sent:", r.responseText)
    });
  }

  setTimeout(markPresence, 5000);
})();
