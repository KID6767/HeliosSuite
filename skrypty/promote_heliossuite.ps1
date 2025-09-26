Param(
  [string]$RepoUser = "KID6767",
  [string]$RepoName = "HeliosSuite"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root "Userscripts\HeliosSuite.user.js"
$docs = Join-Path $root "docs"
$dstDir = Join-Path $docs "Userscripts"
$index = Join-Path $docs "index.html"

if (!(Test-Path $src)) { throw "Brak pliku: $src" }
if (!(Test-Path $docs)) { New-Item -ItemType Directory -Force -Path $docs | Out-Null }
if (!(Test-Path $dstDir)) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }

Copy-Item $src (Join-Path $dstDir "HeliosSuite.user.js") -Force
Write-Host "[OK] Skopiowano HeliosSuite.user.js do docs/Userscripts/"

if (Test-Path $index) {
  $html = Get-Content $index -Raw
  $raw = "https://raw.githubusercontent.com/$RepoUser/$RepoName/main/Userscripts/HeliosSuite.user.js"
  $html = $html -replace '(https://raw\.githubusercontent\.com/[^"]+/Userscripts/HeliosSuite\.user\.js)', $raw
  $html = $html -replace '(https://github\.com/[^"]+/blob/[^"]+/Userscripts/HeliosSuite\.user\.js\?raw=1)', $raw
  Set-Content $index $html -Encoding UTF8
  Write-Host "[OK] Zaktualizowano link w docs/index.html -> $raw"
} else {
  Write-Host "[i] Brak docs/index.html — pomiń aktualizację linku."
}

Write-Host "== DONE ==" -ForegroundColor Cyan
