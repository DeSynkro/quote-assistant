<p align="center">
  <img src="assets/logo.webp" alt="Quote Assistant" width="560">
</p>

<p align="center">
  <strong>Offline estimating for earthmoving jobs.</strong><br>
  Truck loads, material and a rough price, worked out on site.
</p>

<p align="center">
  <a href="Project.md">Project notes</a> ·
  <a href="mockups/quote-assistant-ui.html">UI mockup</a>
</p>

---

## Overview

Quote Assistant is a small internal tool for estimating earthmoving jobs. Enter the truck's capacity and one or more areas to excavate, and it estimates the number of truck loads and a rough price. It can also account for material brought to site, swell, settling, travel and fuel.

The native apps work fully offline. The optional Docker version shares one job list with everyone on the local network.

## Status

Planning and the UI mockup are complete. Application code has not started.

- Planning notes: [Project.md](Project.md)
- UI mockup: [mockups/quote-assistant-ui.html](mockups/quote-assistant-ui.html)
- Calculation tests and sandbox: [tests/tests.html](tests/tests.html)

Open the mockup or the test page directly in a browser.

## Planned features

- Multiple job sections with width, length and optional depth
- Truck limits by volume, weight, or both
- Material presets with swell and settling allowances
- Spoil removal and material delivery calculations
- Optional travel and fuel estimate
- Save, load and name jobs
- Offline native apps with local job storage
- Shared job list for Docker users on the same LAN
- Builds for Windows, Linux, Android and Docker

## Planned stack

| Part | Technology |
| --- | --- |
| Frontend | Plain HTML, CSS and JavaScript |
| Native shell | Tauri 2 and Rust |
| Native storage | Pretty-printed JSON in the OS app data folder |
| Docker server | Node built-in modules, no npm |
| Docker storage | JSON files in `docker/data/jobs/` |
| Testing | `tests/tests.html` and Node's built-in test runner |

## How it runs

- **Native apps:** fully offline. Jobs are saved locally in the OS app data folder.
- **Docker:** serves the same app over the local network. Jobs are stored in the Docker data folder and shared by all LAN users.
- **No cloud:** there are no accounts, no external services and no internet dependency.

## Privacy

Native builds are fully offline. The Docker build is intended for a trusted local network.

- No telemetry, analytics or accounts
- No external network requests from the app
- Native jobs stay on the device
- Docker jobs stay inside the Docker data folder
- No PIN or login, so the Docker port should be blocked from the internet by the firewall

## Project documents

- [Planning notes](Project.md)
- [UI mockup](mockups/quote-assistant-ui.html)

## License

TBD.
