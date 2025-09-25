Param(
  [string]$TargetRoot = "C:\Users\macie\Documents\GitHub\HeliosSuite"
)

$ErrorActionPreference = "Stop"

Write-Host "== HeliosPulse Auto-Deploy ==" -ForegroundColor Cyan

# 1) Sprawdź czy clasp jest zainstalowany
if (-not (Get-Command "clasp" -ErrorAction SilentlyContinue)) {
  Write-Host "[X] clasp nie znaleziony. Zainstaluj go: npm install -g @google/clasp" -ForegroundColor Red
  exit 1
}

# 2) Przejdź do folderu GoogleAppsScript
$GASPath = Join-Path $TargetRoot "Skrypty\GoogleAppsScript"
if (!(Test-Path $GASPath)) {
  Write-Host "[X] Folder GoogleAppsScript nie istnieje" -ForegroundColor Red
  exit 1
}
Set-Location $GASPath

# 3) Push kodu do Google Apps Script
Write-Host "[...] Wysyłam kod do Google Apps Script przez clasp..." -ForegroundColor Yellow
clasp push

Write-Host "[OK] Kod HeliosPulse został zaktualizowany w Google Apps Script" -ForegroundColor Green
Write-Host "Teraz wejdź w Google Apps Script → Deploy → New Deployment → WebApp i wygeneruj nowy URL."
Write-Host "Wklej ten URL przy następnym uruchomieniu instalatora HeliosPulse." -ForegroundColor Cyan
