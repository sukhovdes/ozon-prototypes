# Ozon prototypes

Static prototypes, exported independently of the Vercel deployment.

In repository Settings → Pages set Source to GitHub Actions. Push to main to publish.
The workflow adapts the paths, manifests and service workers to the repository URL.
Latest PWA: `<Pages URL>/product-picker/nbp/`. History: `<Pages URL>/product-picker/#v17`.

Local preview: `PAGES_BASE_PATH="" python3 build_pages.py`, then `python3 -m http.server --directory _site 8766`.
This repository contains the static prototype source and assets only.
Run `npm test` to verify linked slider rules, independent withdrawal, snapping and saved-state migration.
