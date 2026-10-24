<p align="center">
  <img src="assets/logo.webp" alt="Quote Assistant" width="560">
</p>

<p align="center">
  <strong>Offline estimating for earthmoving jobs.</strong><br>
  Truck loads, material and a rough price, worked out on site.
</p>

<p align="center">
  <a href="https://codeberg.org/DeSynkro/quote-assistant/src/branch/main/Project.md">Project notes</a> ·
  <a href="https://codeberg.org/DeSynkro/quote-assistant/src/branch/main/mockups/quote-assistant-ui.html">UI mockup</a>
</p>

---

## Overview

Quote Assistant is a small internal tool for estimating earthmoving jobs. Enter the truck's capacity and one or more areas to excavate, and it estimates the number of truck loads and a rough price. It can also account for material brought to site, swell, settling, travel and fuel.

The native apps work fully offline. The optional Docker version shares one job list with everyone on the local network.

## Status

The calculation engine and estimator UI are working. Open `app/index.html` directly in a browser to use it.

- App: [app/index.html](app/index.html)
- Planning notes: [Project.md](Project.md)
- UI mockup: [mockups/quote-assistant-ui.html](mockups/quote-assistant-ui.html)
- Calculation tests and sandbox: [tests/tests.html](tests/tests.html)

## Working now

- Rectangle, uneven ends, manual area and manual volume sections
- Area, volume and formula shown for each section
- Volume-based spoil truck loads
- Weight-based material delivery capacity
- Truck presets with volume, weight, fuel consumption and price
- Local truck preset save, load and delete
- Material In with direct volume, direct weight or area × depth
- Material cost, delivery pricing and combined spoil and delivery totals
- Swell, price rounding and GST
- Travel and fuel with round trips, truck fuel consumption, price per km and diesel price
- Live estimate, totals and validation warnings
- Fully offline browser app

## Still planned

- Material presets with density, swell and settling values
- Save, load and name jobs
- Uneven fill areas and multiple material entries
- Offline native apps for Windows, Linux and Android
- Shared job list for Docker users on the same LAN
- Shared truck presets for Docker users on the same LAN
- Docker container and native packaging

## Planned stack

| Part | Technology |
| --- | --- |
| Frontend | Plain HTML, CSS and JavaScript |
| Native shell | Tauri 2 and Rust |
| Native storage | Pretty-printed JSON in the OS app data folder |
| Docker server | Node built-in modules, no npm |
| Docker storage | JSON files in `docker/data/jobs/` |
| Testing | `tests/tests.html` and `node tests/run-tests.js` |

## How it runs

- **Browser app:** open `app/index.html`. It works fully offline.
- **Native apps (planned):** fully offline. Jobs will be saved locally in the OS app data folder.
- **Docker (planned):** serves the same app over the local network. Jobs will be stored in the Docker data folder and shared by all LAN users.
- **No cloud:** there are no accounts, no external services and no internet dependency.

## Privacy

The browser app and planned native builds run fully offline. The planned Docker build is intended for a trusted local network.

- No telemetry, analytics or accounts
- No external network requests from the app
- Native jobs stay on the device
- Docker jobs stay inside the Docker data folder
- No PIN or login, so the Docker port should be blocked from the internet by the firewall

## Project documents

- [Estimator app](app/index.html)
- [Planning notes](Project.md)
- [UI mockup](mockups/quote-assistant-ui.html)
- [Calculation tests and sandbox](tests/tests.html)

## License

TBD.
