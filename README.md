# HeliosSuite

Komplet Aegis (motywy), GrepoFusion (pakiet helperów), HeliosPulse (presence/raporty) – w jednym skrypcie Tampermonkey.

## Funkcje
- Zakładka **HeliosSuite** w ustawieniach Grepolis (Motywy/Moduły/HeliosPulse/Czat)
- Motywy: **Classic / Remaster / Piracki / Dark**
- Naprawy UI (z-index/okna) – koniec „zjeżdżania”
- **HeliosPulse**: ping obecności + generowanie dziennego raportu (BBCode do schowka)
- **Czat (alpha)** – lokalny (browser-local). Docelowo kanały Sojusz/Pakt/Global via backend.

## Instalacja
1. Wejdź na stronę: https://kid6767.github.io/HeliosSuite/
2. Kliknij „Zainstaluj w Tampermonkey”.
3. Odśwież Grepolis. Ikona ☀️ po lewej otwiera panel. Zakładka w Ustawieniach pojawi się automatycznie.

## Konfiguracja backendu
- `WEBAPP_URL`: wskazuje na Google Apps Script `/exec` 
- `TOKEN`: `HeliosPulseToken`

W obecnej wersji wartości są już wpisane w skrypcie.
