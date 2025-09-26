$Base = Split-Path -Parent $PSScriptRoot
$Zip  = Join-Path $env:TEMP "HeliosSuite_AllInOne.zip"

if (Test-Path $Zip) { Remove-Item $Zip -Force }
Compress-Archive -Path (Join-Path $Base "*") -DestinationPath $Zip -Force
Write-Host "[OK] ZIP: $Zip" -ForegroundColor Green

# szybki sanity check linków raw
$A = Test-Path (Join-Path $Base "Userscripts\Aegis.user.js")
$G = Test-Path (Join-Path $Base "Userscripts\GrepoFusion.user.js")
$H = Test-Path (Join-Path $Base "Userscripts\HeliosPulse.user.js")
if ($A -and $G -and $H) { Write-Host "[OK] Userscripts present" -ForegroundColor Green } else { Write-Host "[!] Missing userscripts" -ForegroundColor Yellow }
