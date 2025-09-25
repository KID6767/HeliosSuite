# HeliosSuite_allinone.ps1
# Kompletny setup HeliosSuite (HeliosPulse + Aegis + GrepoFusion)
# Wersja stabilna – bez fajerwerków i błędów parsowania

Write-Host "== HeliosSuite Installer ==" -ForegroundColor Cyan

$BaseDir = "C:\Users\macie\Documents\GitHub\HeliosSuite"
$SkryptyDir = Join-Path $BaseDir "Skrypty"
$PSDir = Join-Path $SkryptyDir "PowerShell"
$USDir = Join-Path $BaseDir "Userscripts"
$WWWDir = Join-Path $BaseDir "www"

# Tworzenie struktury katalogów
$paths = @(
    $BaseDir,
    $SkryptyDir,
    $PSDir,
    $USDir,
    (Join-Path $BaseDir "HeliosPulse"),
    (Join-Path $BaseDir "Aegis"),
    (Join-Path $BaseDir "GrepoFusion"),
    $WWWDir
)

foreach ($p in $paths) {
    if (!(Test-Path $p)) {
        New-Item -ItemType Directory -Force -Path $p | Out-Null
        Write-Host "[+] Created $p" -ForegroundColor Green
    } else {
        Write-Host "[i] Exists: $p" -ForegroundColor Yellow
    }
}

# ===============================
# Userscripty (placeholders)
# ===============================

$HeliosPulseJS = @"
// ==UserScript==
// @name         HeliosPulse
// @namespace    https://kid6767.github.io/HeliosPulse/
// @version      1.0
// @description  HeliosPulse core
// @match        https://*.grepolis.com/*
// ==/UserScript==
console.log('HeliosPulse loaded.');
"@

$AegisJS = @"
// ==UserScript==
// @name         Aegis
// @namespace    https://kid6767.github.io/Aegis/
// @version      1.0
// @description  Aegis visual remaster
// @match        https://*.grepolis.com/*
// ==/UserScript==
console.log('Aegis loaded.');
"@

$GrepoFusionJS = @"
// ==UserScript==
// @name         GrepoFusion
// @namespace    https://kid6767.github.io/GrepoFusion/
// @version      1.0
// @description  GrepoFusion mega-pack
// @match        https://*.grepolis.com/*
// ==/UserScript==
console.log('GrepoFusion loaded.');
"@

Set-Content -Path (Join-Path $USDir "HeliosPulse.user.js") -Value $HeliosPulseJS -Encoding UTF8
Set-Content -Path (Join-Path $USDir "Aegis.user.js") -Value $AegisJS -Encoding UTF8
Set-Content -Path (Join-Path $USDir "GrepoFusion.user.js") -Value $GrepoFusionJS -Encoding UTF8

Write-Host "[OK] Userscripts zapisane" -ForegroundColor Green

# ===============================
# README + index.html
# ===============================

$readme = @"
# HeliosSuite

Pakiet dodatków do Grepolis:

- HeliosPulse (raporty, integracja z Google Sheets)
- Aegis (remaster graficzny)
- GrepoFusion (wszystkie dodatki + automatyzacje)

Instrukcja:
1. Zainstaluj [Tampermonkey](https://www.tampermonkey.net/).
2. Dodaj userscripty z folderu Userscripts.
3. Odśwież Grepolis.
"@

Set-Content -Path (Join-Path $BaseDir "README.md") -Value $readme -Encoding UTF8

$index = @"
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HeliosSuite</title>
</head>
<body>
  <h1>HeliosSuite</h1>
  <ul>
    <li><a href="Userscripts/HeliosPulse.user.js">HeliosPulse</a></li>
    <li><a href="Userscripts/Aegis.user.js">Aegis</a></li>
    <li><a href="Userscripts/GrepoFusion.user.js">GrepoFusion</a></li>
  </ul>
</body>
</html>
"@

Set-Content -Path (Join-Path $WWWDir "index.html") -Value $index -Encoding UTF8

# ===============================
# Podsumowanie
# ===============================

Write-Host "-------------------------------------"
Write-Host "[CHECKLIST]" -ForegroundColor Cyan
Write-Host " - Struktura katalogów OK"
Write-Host " - Userscripts OK"
Write-Host " - README.md OK"
Write-Host " - www/index.html OK"
Write-Host "-------------------------------------"
Write-Host "✅ Wszystko gotowe! Dodaj userscripty do Tampermonkey i odśwież Grepolis." -ForegroundColor Green
