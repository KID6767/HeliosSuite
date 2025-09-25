Param(
  [string]$Base64Path = "C:\Users\macie\Documents\GitHub\HeliosSuite\HeliosSuite_AllInOne.b64",
  [string]$TargetRoot = "C:\Users\macie\Documents\GitHub\HeliosSuite",
  [string]$GitRemote = "",   # np. https://github.com/User/HeliosSuite.git
  [string]$GitBranch = "main",
  [string]$CommitMsg = "HeliosSuite: auto update"
)

$ErrorActionPreference = "Stop"

Write-Host "== HeliosSuite Installer ==" -ForegroundColor Cyan

# 1) Base64 decode
if (!(Test-Path $Base64Path)) {
  Write-Host "[X] File not found: $Base64Path" -ForegroundColor Red
  exit 1
}
Write-Host "[OK] Base64 package found"
$ZipOut = Join-Path $TargetRoot "HeliosSuite_AllInOne.zip"
$base64 = Get-Content $Base64Path -Raw
[IO.File]::WriteAllBytes($ZipOut, [Convert]::FromBase64String($base64))

# 2) Unpack
Write-Host "[...] Unpacking package..."
if (!(Test-Path $TargetRoot)) { New-Item -ItemType Directory -Force -Path $TargetRoot | Out-Null }
Expand-Archive -Path $ZipOut -DestinationPath $TargetRoot -Force
Remove-Item $ZipOut -Force
Write-Host "[OK] Unpacked to: $TargetRoot" -ForegroundColor Green

# 3) Git
Set-Location $TargetRoot
if (!(Test-Path ".git")) {
  git init | Out-Null
  if ($GitRemote) { git remote add origin $GitRemote | Out-Null }
  Write-Host "[OK] Git repository initialized" -ForegroundColor Green
}
git add -A
try {
  git commit -m $CommitMsg | Out-Null
  Write-Host "[OK] Git commit created" -ForegroundColor Green
} catch {
  Write-Host "[i] No changes to commit" -ForegroundColor Yellow
}
if ($GitRemote) {
  git push -u origin $GitBranch
  Write-Host "[OK] Git pushed to $GitRemote ($GitBranch)" -ForegroundColor Green
}

# 4) Update Google Apps Script via clasp
$GASPath = Join-Path $TargetRoot "Skrypty\GoogleAppsScript"
if (Test-Path $GASPath) {
  if (-not (Get-Command "clasp" -ErrorAction SilentlyContinue)) {
    Write-Host "[!] clasp not found. Install: npm install -g @google/clasp" -ForegroundColor Yellow
  } else {
    Set-Location $GASPath
    Write-Host "[...] Deploying Code.gs to Google Apps Script..."
    clasp push
    Write-Host "[OK] Code.gs updated in Google Apps Script" -ForegroundColor Green
  }
}

# 5) Prompt new WebApp URL
$newUrl = Read-Host "Paste the NEW WebApp URL from Google Apps Script (e.g., https://script.google.com/.../exec)"
if ($newUrl -and $newUrl -match '^https://script\.google\.com/macros/') {
  $configPath = Join-Path $TargetRoot "Skrypty\Config.json"
  $userJsPath = Join-Path $TargetRoot "Skrypty\HeliosPulse.user.js"

  if (Test-Path $configPath) {
    (Get-Content $configPath -Raw) -replace '"WEBAPP_URL":\s*".*?"', '"WEBAPP_URL": "'+$newUrl+'"' | Set-Content $configPath -Encoding UTF8
    Write-Host "[OK] Config.json updated" -ForegroundColor Green
  }
  if (Test-Path $userJsPath) {
    (Get-Content $userJsPath -Raw) -replace 'WEBAPP_URL:\s*".*?"', 'WEBAPP_URL: "'+$newUrl+'"' | Set-Content $userJsPath -Encoding UTF8
    Write-Host "[OK] HeliosPulse.user.js updated" -ForegroundColor Green
  }
} else {
  Write-Host "[i] URL not changed." -ForegroundColor Yellow
}

# 6) Final checklist
Write-Host "----------------------------------"
Write-Host "[✔] Base64 unpacked"
Write-Host "[✔] Git updated"
Write-Host "[✔] Apps Script deployed (if clasp configured)"
Write-Host "[✔] Config refreshed"
Write-Host "----------------------------------"
Write-Host "== DONE ==" -ForegroundColor Cyan
