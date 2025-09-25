Param([string]$NewUrl)
if(-not $NewUrl){ $NewUrl = Read-Host "Wklej WebApp URL (https://script.google.com/.../exec)" }
if(-not $NewUrl){ Write-Host "No URL supplied. Exiting."; exit 1 }
$Repo = Join-Path $env:USERPROFILE "Documents\GitHub\HeliosSuite"
$HP = Join-Path $Repo "Userscripts\HeliosPulse.user.js"
if(-not (Test-Path $HP)){ Write-Host "HeliosPulse.user.js not found at $HP"; exit 1 }
$t = Get-Content $HP -Raw
# replace placeholder WEBAPP_URL: "" with actual URL (safe replace)
$t = $t -replace 'WEBAPP_URL:\s*""', 'WEBAPP_URL: "' + $NewUrl + '"' 
Set-Content -Path $HP -Value $t -Encoding UTF8
Write-Host "[OK] Updated HeliosPulse.user.js with new WEBAPP URL"
