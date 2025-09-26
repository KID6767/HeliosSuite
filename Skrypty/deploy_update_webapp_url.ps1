param(
    [string]$NewUrl = ""
)

$HP = Join-Path (Split-Path $PSScriptRoot -Parent) "Userscripts\HeliosPulse.user.js"

if (-not (Test-Path $HP)) {
    Write-Host "[ERR] Nie znaleziono pliku: $HP" -ForegroundColor Red
    exit 1
}

if ($NewUrl -eq "") {
    $NewUrl = Read-Host "Wklej WebApp URL (https://script.google.com/.../exec)"
}

$t = Get-Content $HP -Raw

# poprawiona podmiana
$t = $t -replace 'WEBAPP_URL:\s*""', "WEBAPP_URL: `"$NewUrl`""

Set-Content -Path $HP -Value $t -Encoding UTF8

Write-Host "[OK] Updated HeliosPulse.user.js with new WEBAPP URL"
