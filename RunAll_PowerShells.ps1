# RunAll_PowerShells.ps1 - znajdz i uruchom wszystkie .ps1 w repo (rekurencyjnie), logi do .\logs\
param([string]$Root = (Split-Path -Parent $MyInvocation.MyCommand.Path))
$ErrorActionPreference = "Stop"
$logs = Join-Path $Root "logs"
if(!(Test-Path $logs)){ New-Item -Path $logs -ItemType Directory | Out-Null }
$scripts = Get-ChildItem -Path $Root -Recurse -Filter "*.ps1" -File | Where-Object { $_.FullName -ne $MyInvocation.MyCommand.Path } | Sort-Object FullName
if($scripts.Count -eq 0){ Write-Host "Brak .ps1 w: $Root"; exit 0 }
$idx = 0
foreach($s in $scripts){
  $idx++
  $ts = Get-Date -Format "yyyyMMdd_HHmmss"
  $log = Join-Path $logs ("{0}_{1:D2}_{2}.log" -f $ts,$idx,$s.BaseName)
  Write-Host ("[{0}/{1}] {2}" -f $idx,$scripts.Count,$s.FullName) -ForegroundColor Cyan
  $cmd = "& { & `"$($s.FullName)`" } 2>&1 | Out-File -FilePath `"$log`" -Encoding UTF8; if ($LASTEXITCODE -ne $null) { exit $LASTEXITCODE }"
  $p = Start-Process -FilePath (Get-Command powershell).Source -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-Command",$cmd -Wait -PassThru -WindowStyle Hidden
  if ($p.ExitCode -ne 0) {
    Write-Host ("[ERR] ExitCode {0} -> {1}" -f $p.ExitCode, $log) -ForegroundColor Red
    $ans = Read-Host "Kontynuowac? (Y/N)"
    if($ans -notmatch "^[Yy]"){ break }
  } else {
    Write-Host ("[OK] -> {0}" -f $log) -ForegroundColor Green
  }
}
Write-Host "Gotowe."
