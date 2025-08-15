
# Trading Dashboard (Portable, Offline) — Auto-fetch Netlify HTML

This project builds a **portable .exe** (no install) containing your **latest** dashboard HTML.
During `npm run portable`, it fetches your page’s HTML from the URL in `config.json` and embeds it as `index.html`.

## Set your URL
Edit `config.json`:
```json
{ "siteUrl": "https://YOUR-SITE.netlify.app" }
```

## Build the portable EXE
1) Install Node.js (LTS): https://nodejs.org/
2) In this folder, run:
   ```bash
   npm install
   npm run portable
   ```
3) Output: **Trading Dashboard (Portable, Offline) 1.0.0.exe**

## Use
- Double‑click the EXE to run offline (voice supported).
- Auto‑backup CSVs on close into `backups/` next to the EXE.
- App data is stored in `data/` next to the EXE.

*Tip:* Rebuild any time you update your Netlify site to bake the latest HTML into a new portable EXE.
