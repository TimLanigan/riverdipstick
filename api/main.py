from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI(title="Riverdipstick", version="2.0.0")

PAGE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Riverdipstick</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center;
      background: #0e1116; color: #e7e9ee;
      font: 18px/1.45 ui-sans-serif, system-ui, sans-serif;
    }
    main { max-width: 34rem; padding: 2rem; }
    h1 { font-weight: 560; letter-spacing: -0.03em; margin: 0 0 0.4rem; }
    p { color: #b7bdc9; }
    a { color: #7eb6ff; }
    code { color: #e7e9ee; }
  </style>
</head>
<body>
  <main>
    <h1>Riverdipstick</h1>
    <p>2.0 preview on the home network. Nothing to fish with yet — the station pages come next.</p>
    <p>1.0 is still <a href="https://riverdipstick.uk">riverdipstick.uk</a>.</p>
    <p>Health: <a href="/health"><code>/health</code></a></p>
  </main>
</body>
</html>
"""


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "riverdipstick", "version": "2.0.0"}


@app.get("/", response_class=HTMLResponse)
def home() -> str:
    return PAGE
