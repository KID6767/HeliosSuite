$path = "C:\Users\macie\Documents\GitHub\HeliosSuite\www\index.html"

$html = @"
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>HeliosSuite</title>
  <style>
    body {
      background-color: #0d1b2a;
      color: #f1d78a;
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    header {
      text-align: center;
      padding: 30px;
      background-color: #1b263b;
    }
    header h1 {
      color: #ffd700;
      margin: 0;
    }
    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
    }
    .card-container {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      justify-content: center;
      max-width: 1200px;
    }
    .card {
      background-color: #1b263b;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 20px;
      width: 280px;
      text-align: center;
    }
    .card h2 {
      color: #ffd700;
      margin-bottom: 10px;
    }
    .card p {
      font-size: 14px;
      color: #ccc;
      margin-bottom: 20px;
    }
    .btn {
      background-color: #ffd700;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      text-decoration: none;
      color: black;
    }
    .btn:hover {
      background-color: #e6c200;
    }
    footer {
      text-align: center;
      padding: 20px;
      background-color: #1b263b;
      font-size: 12px;
      color: #aaa;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <header>
    <h1>HELIOS SUITE</h1>
    <p>HeliosPulse • Aegis • GrepoFusion</p>
  </header>

  <main>
    <p>Instalacja: kliknij poniższe przyciski, a skrypty otworzą się w Tampermonkey. Potwierdź instalację i odśwież Grepolis.</p>

    <div class="card-container">
      <div class="card">
        <h2>HeliosPulse</h2>
        <p>Obecność, last_seen, dzienne raporty (Google Apps Script).</p>
        <a class="btn" href="https://raw.githubusercontent.com/KID6767/HeliosSuite/main/Userscripts/HeliosPulse.user.js">Zainstaluj</a>
      </div>

      <div class="card">
        <h2>Aegis (UI Remaster)</h2>
        <p>Butelkowa zieleń + złoto, stylizacja UI, placeholder logo.</p>
        <a class="btn" href="https://raw.githubusercontent.com/KID6767/HeliosSuite/main/Userscripts/Aegis.user.js">Zainstaluj</a>
      </div>

      <div class="card">
        <h2>GrepoFusion (Hub)</h2>
        <p>Panel pomocniczy i miejsce na Twoje moduły (bez auto-click).</p>
        <a class="btn" href="https://raw.githubusercontent.com/KID6767/HeliosSuite/main/Userscripts/GrepoFusion.user.js">Zainstaluj</a>
      </div>
    </div>
  </main>

  <footer>
    © HeliosSuite
  </footer>
</body>
</html>
"@

Set-Content -Path $path -Value $html -Encoding UTF8

Write-Host "[OK] index.html został zaktualizowany w $path" -ForegroundColor Green
