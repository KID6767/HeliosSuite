param(
    [string]$NewUrl = ""
)

$HP = Join-Path $PSScriptRoot "..\Userscripts\HeliosPulse.user.js"

if (-not (Test-Path $HP)) {
    Write-Host "[ERR] Nie znaleziono pliku HeliosPulse.user.js" -ForegroundColor Red
    exit 1
}

if (-not $NewUrl) {
    $NewUrl = Read-Host "Wklej WebApp URL (https://script.google.com/.../exec)"
}

$t = Get-Content $HP -Raw

# ✅ Poprawiony replace (BEZ + $NewUrl +)
$t = $t -replace 'WEBAPP_URL:\s*""', "WEBAPP_URL: `"$NewUrl`""

try {
    Set-Content -Path $HP -Value $t -Encoding UTF8 -Force
    Write-Host "[OK] Updated HeliosPulse.user.js with new WEBAPP URL" -ForegroundColor Green
}
catch {
    Write-Host "[ERR] Nie mogę zapisać pliku (jest otwarty gdzie indziej)" -ForegroundColor Red
}
