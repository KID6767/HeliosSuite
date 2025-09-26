Write-Host "== Running all HeliosSuite scripts ==" -ForegroundColor Cyan

$Skrypty = Join-Path $PSScriptRoot "."   # folder, w którym leży ten plik
$All = Get-ChildItem -Path $Skrypty -Filter *.ps1 | Where-Object { $_.Name -ne "run_all.ps1" }

foreach ($f in $All) {
    Write-Host ">>> Running $($f.Name)" -ForegroundColor Yellow
    & powershell -ExecutionPolicy Bypass -File $f.FullName
}

Write-Host "== DONE ==" -ForegroundColor Cyan
