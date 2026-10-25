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

The native apps will work fully offline. The optional Docker version shares one job list and truck presets with everyone on the local network.

## Status

The calculation engine, estimator UI and Docker Compose LAN version are working. Open `app/index.html` directly in a browser, or run Docker Compose for shared jobs and presets.

- App: [app/index.html](app/index.html)
- Planning notes: [Project.md](Project.md)
- UI mockup: [mockups/quote-assistant-ui.html](mockups/quote-assistant-ui.html)
- Calculation tests and sandbox: [tests/tests.html](tests/tests.html)

## Working now

- Removals with rectangle, uneven ends, manual area and manual volume sections
- Removals can be disabled for material-only jobs
- Per-section swell, off by default with a 5% default
- Area, volume and formula shown for each section
- Volume-based spoil truck loads
- Weight-based material delivery capacity
- Truck presets with volume, weight, fuel consumption and price
- Truck preset save, load and delete
- Multiple material entries with direct volume, direct weight or area × depth
- Material cost, delivery pricing and combined spoil and delivery totals
- Swell, price rounding and GST
- Travel and fuel with round trips, truck fuel consumption, price per km and diesel price
- Save, load and delete jobs in the browser or shared Docker store
- Autosave the current job as a local draft and restore it after a reload
- Search saved jobs by name, summary or date
- Refresh shared jobs and presets from the Load panel
- Automatic timestamp names when a job is unnamed
- Export and import jobs and truck presets as JSON
- Docker Compose LAN app with shared jobs and truck presets
- Live estimate, totals and validation warnings
- Offline browser app and LAN Docker build

## Still planned

- Material presets with default prices, swell and settling values
- Uneven fill areas
- Offline native apps for Windows, Linux and Android

## Stack

| Part | Technology |
| --- | --- |
| Frontend | Plain HTML, CSS and JavaScript |
| Native shell | Tauri 2 and Rust |
| Native storage | Pretty-printed JSON in the OS app data folder |
| Docker server | Node built-in modules, no npm |
| Docker orchestration | Docker Compose |
| Docker storage | JSON files in `docker/data/jobs/` and `docker/data/presets.json` |
| Testing | `tests/tests.html`, `node tests/run-tests.js` and `node --test tests/server.test.js` |

## How it runs

- **Browser app:** open `app/index.html`. It works fully offline and stores data in the browser.
- **Docker Compose:** serves the same app over the local network. Jobs and truck presets are stored in the Docker data folder and shared by all LAN users.
- **Native apps (planned):** fully offline. Jobs will be saved locally in the OS app data folder.
- **No cloud:** there are no accounts, no external services and no internet dependency.

## Docker Compose

The Docker setup lives in `docker/`. Run these commands from the project root. Prefix them with `sudo` if your Docker setup requires it.

```sh
cp docker/.env.example docker/.env
# Set PUID and PGID in docker/.env to match id -u and id -g. The default is 1000.
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.yml logs -f
```

Open `http://<this-computer-ip>:8080` from another device on the same network. The app detects the Docker API automatically and switches to shared storage. Without the API it falls back to browser storage.

The shared data lives in `docker/data/`:

- `jobs/` has one pretty-printed JSON file per job.
- `presets.json` has the shared truck presets.
- `trash/` receives deleted jobs instead of erasing them immediately.

Stop the stack and copy `docker/data/` to back up everything:

```sh
docker compose -f docker/docker-compose.yml stop
cp -a docker/data quote-assistant-backup
docker compose -f docker/docker-compose.yml start
```

There is no login. Keep port `8080` blocked from the internet with the host firewall. To rebuild after changes, run `docker compose -f docker/docker-compose.yml up -d --build`. To stop and remove the container, run `docker compose -f docker/docker-compose.yml down`.

To run the server without Docker for local testing:

```sh
DATA_DIR="$PWD/docker/data" node docker/server.js
```

Then open `http://127.0.0.1:8080`.

## Privacy

The browser app runs fully offline. Native builds will do the same. The Docker build is intended for a trusted local network.

- No telemetry, analytics or accounts
- No external network requests. Docker uses only the local server.
- Native jobs stay on the device
- Docker jobs and presets stay inside the Docker data folder
- No PIN or login, so the Docker port should be blocked from the internet by the firewall

## Project documents

- [Estimator app](app/index.html)
- [Planning notes](Project.md)
- [UI mockup](mockups/quote-assistant-ui.html)
- [Calculation tests and sandbox](tests/tests.html)

## License

TBD.
