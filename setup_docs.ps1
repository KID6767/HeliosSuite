Write-Host "== Tworzenie folderu docs/ dla GitHub Pages ==" -ForegroundColor Cyan

$Docs = Join-Path $PSScriptRoot "docs"
$Img = Join-Path $Docs "img"

if (-Not (Test-Path $Docs)) { New-Item -ItemType Directory -Path $Docs | Out-Null }
if (-Not (Test-Path $Img)) { New-Item -ItemType Directory -Path $Img | Out-Null }

# index.html
@"
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HeliosSuite – Instalacja dodatków</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>☀️ HeliosSuite</h1>
    <p>⚔️ Aegis (UI), 🌌 GrepoFusion (hub), ☀️ HeliosPulse (raporty + obecność)</p>
  </header>

  <main>
    <section class="addon">
      <img src="img/aegis.png" alt="Aegis screenshot">
      <h2>⚔️ Aegis</h2>
      <p>Złoto-czarny wygląd, ikony w menu, 4 motywy (Classic, Remaster, Piracki, Dark).</p>
      <a class="btn" href="../Userscripts/Aegis.user.js">Zainstaluj Aegis</a>
    </section>

    <section class="addon">
      <img src="img/grepo.png" alt="GrepoFusion screenshot">
      <h2>🌌 GrepoFusion</h2>
      <p>Panel ustawień a’la GCRT + zintegrowane helpy (City Indexer, Transport, Zeitrechner, Map Enhancer).</p>
      <a class="btn" href="../Userscripts/GrepoFusion.user.js">Zainstaluj GrepoFusion</a>
    </section>

    <section class="addon">
      <img src="img/pulse.png" alt="HeliosPulse screenshot">
      <h2>☀️ HeliosPulse</h2>
      <p>Raporty obecności i logi w grze. Ikona w menu, eksport do Google Sheets.</p>
      <a class="btn" href="../Userscripts/HeliosPulse.user.js">Zainstaluj HeliosPulse</a>
    </section>
  </main>

  <footer>
    <p>© HeliosSuite 2025 | Upewnij się, że masz zainstalowane Tampermonkey w przeglądarce.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>
"@ | Set-Content -Path (Join-Path $Docs "index.html") -Encoding UTF8

# style.css
@"
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: linear-gradient(180deg, #0a0f1c, #101828);
  color: #eee;
  text-align: center;
}
header { padding: 2rem 1rem; }
h1 { color: #ffd54f; margin-bottom: .5rem; }
main { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; padding: 2rem; }
.addon { background: #1b2233; border-radius: 12px; padding: 1.5rem; width: 280px; box-shadow: 0 0 20px rgba(255,213,79,0.15); transition: transform 0.2s; }
.addon:hover { transform: scale(1.05); }
.addon img { width: 100%; border-radius: 8px; margin-bottom: 1rem; }
.btn { display: inline-block; background: #ffd54f; color: #000; text-decoration: none; font-weight: bold; padding: .6rem 1rem; border-radius: 6px; transition: background 0.2s; }
.btn:hover { background: #ffb300; }
footer { margin-top: 3rem; padding: 1rem; font-size: 0.9rem; color: #aaa; }
.star { position: absolute; width: 4px; height: 4px; background: #ffd54f; border-radius: 50%; pointer-events: none; animation: fade 1.5s forwards; }
@keyframes fade { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(3); } }
"@ | Set-Content -Path (Join-Path $Docs "style.css") -Encoding UTF8

# script.js
@"
document.addEventListener("mousemove", e => {
  const star = document.createElement("div");
  star.className = "star";
  star.style.left = `${e.pageX}px`;
  star.style.top = `${e.pageY}px`;
  document.body.appendChild(star);
  setTimeout(() => star.remove(), 1500);
});
"@ | Set-Content -Path (Join-Path $Docs "script.js") -Encoding UTF8

# Placeholdery PNG
$aegis = Join-Path $Img "aegis.png"
$grepo = Join-Path $Img "grepo.png"
$pulse = Join-Path $Img "pulse.png"
Set-Content $aegis "placeholder aegis" -Encoding ASCII
Set-Content $grepo "placeholder grepo" -Encoding ASCII
Set-Content $pulse "placeholder pulse" -Encoding ASCII

Write-Host "== DONE: folder docs/ gotowy, możesz pushować na GitHub ==" -ForegroundColor Green
