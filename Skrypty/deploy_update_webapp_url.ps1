Param(
  [Parameter(Mandatory=$false)]
  [string]$NewUrl
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$UserJs = Join-Path $Root "Userscripts\HeliosPulse.user.js"

if (-not (Test-Path $UserJs)) {
  Write-Host "[X] Not found: $UserJs" -ForegroundColor Red
  exit 1
}

if (-not $NewUrl) {
  $NewUrl = Read-Host "Wklej WebApp URL (https://script.google.com/.../exec)"
}

$t = Get-Content $UserJs -Raw

# podmień wartość po WEBAPP_URL: "..."
$t = $t -replace '(WEBAPP_URL:\s*")([^"]*)(")', "`$1$NewUrl`$3"

Set-Content -Path $UserJs -Value $t -Encoding UTF8
Write-Host "[OK] Updated HeliosPulse.user.js with new WEBAPP URL" -ForegroundColor Green
