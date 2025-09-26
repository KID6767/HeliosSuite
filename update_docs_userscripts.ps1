# Ścieżki bazowe
$RepoRoot = "C:\Users\macie\Documents\GitHub\HeliosSuite"
$SrcDir   = Join-Path $RepoRoot "Userscripts"
$DocsDir  = Join-Path $RepoRoot "docs\Userscripts"
$IndexFile = Join-Path $RepoRoot "docs\index.html"

Write-Host "== HeliosSuite: Aktualizacja GitHub Pages =="

# 1. Utwórz folder docs/Userscripts jeśli nie istnieje
if (!(Test-Path $DocsDir)) {
    New-Item -ItemType Directory -Path $DocsDir -Force | Out-Null
    Write-Host "[OK] Utworzono folder: $DocsDir"
}

# 2. Skopiuj wszystkie .user.js do docs/Userscripts
Get-ChildItem -Path $SrcDir -Filter "*.user.js" | ForEach-Object {
    Copy-Item $_.FullName -Destination $DocsDir -Force
    Write-Host "[OK] Skopiowano $($_.Name) do docs/Userscripts/"
}

# 3. Podmień linki w docs/index.html
if (Test-Path $IndexFile) {
    $html = Get-Content $IndexFile -Raw

    $html = $html -replace '(Userscripts\/Aegis\.user\.js)',
        'docs/Userscripts/Aegis.user.js'
    $html = $html -replace '(Userscripts\/GrepoFusion\.user\.js)',
        'docs/Userscripts/GrepoFusion.user.js'
    $html = $html -replace '(Userscripts\/HeliosPulse\.user\.js)',
        'docs/Userscripts/HeliosPulse.user.js'

    Set-Content -Path $IndexFile -Value $html -Encoding UTF8
    Write-Host "[OK] Zaktualizowano linki w index.html"
} else {
    Write-Host "[WARN] Nie znaleziono pliku index.html w $IndexFile"
}

Write-Host "== DONE: Strona instalacyjna powinna działać bez 404 ✅ =="
