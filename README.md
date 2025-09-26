# HeliosSuite (TEMP MONO)

> **Tymczasowa** scalona wersja trzech dodatków do Grepolis:
- **Aegis** — motywy (jasny/ciemny) + poprawki UI/okien.
- **GrepoFusion** — hub + helpers + eksport CSV (indeks miast).
- **HeliosPulse** — ping obecności + raport dzienny (BBCode/JSON z Google Apps Script).

Docelowo każdy z nich będzie **osobnym userscriptem i repo**. HeliosSuite zostanie usunięty, gdy rozdzielimy moduły i ustabilizujemy API.

## Instalacja
1. Zainstaluj **Tampermonkey**.
2. Skopiuj zawartość `HeliosSuite.user.js` → **Nowy skrypt** → Zapisz.
3. Odśwież Grepolis.

## Funkcje
- Przełącznik motywu (FAB w prawym dolnym rogu lub menu Tampermonkey).
- Globalny fix okien Grepolis (tła, przewijanie, cienie, border).
- GrepoFusion Hub (lewy górny róg) → **Export CSV** miast.
- HeliosPulse Box (lewy dolny róg) → **Ping obecności**, **Podgląd raportu dziennego (BBCode)**.

## Wymagania
- Grepolis (przeglądarka desktop).
- Tampermonkey 5.x.
- (opcjonalnie do raportów) **Google Apps Script WebApp** (URL + token).

## Konfiguracja
W tej wersji URL i token są **zaszyte na stałe** (na prośbę użytkownika):
```js
WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyHm1SuEMUyfeRUiU9ttQLyfaix1QacKaJhU0tGdB_YQb9ToaWHiRoYA55lPvkmIceq3w/exec"
TOKEN      = "HeliosPulseToken"
