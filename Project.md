# Quote Assistant

A local-first, privacy-first estimator for earthmoving quotes. Native builds run
fully offline; the Docker build stays on the local network. Used internally on the
spot while measuring a job; the customer never sees the output.

UI mockup for review: [`mockups/quote-assistant-ui.html`](mockups/quote-assistant-ui.html)

---

## Initial Scope (original notes - kept for history)

> Everything in this section is the original brief. Where it conflicts with
> "Confirmed Decisions" below, the confirmed decisions win.

A simple project to assist with making estimations and quotes for an earthmoving company.
User inputs parameters for the job such as Truck Size, Length x Width of the area and Height of area escavated (Material taken from ground and put on truck)
Calculations are made and gives an accurate as possible estimate on the total area occupied and whether it'll fit in the truck and/or how many trucks will be needed

### Requirements (original)
- Truck Size (User Input)
- Area of excavation. (Width x Length) and how deep (height) (user input)
- Options for M, CM, MM measuring. letting user choose what they prefer
- Material Costs and Quantity (User Input)
- Price Input for each truck and adaptable. so if the truck costs $800, but we get a total of 1.5 trucks, the price is adapted to that so $1200 or any other outcome. (Round Up Button so anything with a decimal rounds up to the price of 2 and so on)
- Total Outcome and a brief description. such as "Material will fit in * Truck(s)" or something like that

### Apps / Programs (original)
- Portable .exe for windows
- Appimage for Linux
- Docker Container
- APK

### Functionality (original)
I'm thinking maybe a webUI unless a better option is suggested. For the exe and Appimage, make an integrated webUI within those apps and the settings are saved in .config for linux and appdata for windows

---

## Confirmed Decisions (from design discussion)

### Purpose and scope
- Internal estimating aid, not a customer-facing quote generator.
- Used on site to sanity-check price and truck count without relying on AI.
- Results are for the operator only; no printed quote, no customer details.
- Native builds are fully offline. The Docker build runs on the local network
  only. Neither uses telemetry, analytics, accounts, cloud storage or external
  data collection.

### Platforms
- Windows portable `.exe`
- Linux AppImage
- Android APK
- Docker container serving the same web app
- One shared web UI across all four.
- Native apps store plain JSON in the OS app data folder through a small Tauri
  storage bridge.
- Docker serves the same UI from a tiny Node server and stores jobs in
  `docker/data/jobs/`, shared by everyone using the LAN web app.

### Truck capacity
- Truck size can be entered as volume (m³), weight (tonnes), or **both**.
- When both are given, check both limits and report which one actually binds
  (volume-limited vs weight-limited).
- Reference truck: roughly 8 t and 6.5 m³, both editable.
- Price is entered **per truck** and scales with the number of trucks.

### Job structure
- A job is modular: multiple sections, each added with an "Add More" button.
- Each section: width × length × optional depth, plus a material choice.
- Sections are independent and can be added, duplicated, removed, and reordered.
- A section may instead use a manual volume override for irregular shapes.

### Materials and density
- Volume-only is the default path; weight and density are optional.
- Material presets are available but optional. Presets carry loose bulk density,
  swell %, and (for rubble) a voids %.
- Presets are starting points only; every value is editable per job.
- Concrete removal needs void/air-gap handling, not just solid density.

### Swell / bulking
- Excavated material expands; in-ground volume is not truck volume.
- Swell is applied per job via a checkbox plus a % input, **off by default**.
- Presets may suggest a swell figure, but it stays off until enabled.

### Units
- Units are per field, not one global unit.
- Defaults: footprint dimensions in metres, depth in millimetres.
- Each field offers m / cm / mm; truck volume in m³ and weight in tonnes.

### Unknown depth
- "Include height?" toggle per section. When off, the section still counts toward
  the estimate using an optional **assumed depth** (default 100 mm), clearly
  flagged in the result, or a manual volume override.
- The result distinguishes measured values from assumed ones.

### Bring-in material (added during discussion)
- Some jobs also require material to be brought **to** the site, not just spoil
  removed.
- A per-job checkbox ("Bringing material?") reveals a separate delivery segment.
- Choose a preset or define a custom material, with a price per m³ or per tonne
  and the amount required.
- The delivery segment calculates its own truck count (e.g. "You need to bring
  X trucks") and its own cost.
- The job shows three results: removal trucks/price, delivery trucks/price, and
  a combined "roughly X trucks there and back, charge X" total.
- Optional **Custom delivery fee** checkbox, blank by default. When enabled it
  overrides the calculated delivery trip cost; the material cost stays separate.
- Full calculation rules for delivery (how the amount is derived, compaction,
  and whether truck rate is charged per delivery trip) still to be confirmed.

### Travel and fuel (added during discussion)
- Optional section below Material In, disabled by default.
- Inputs: distance from the job (one-way km), diesel price ($/L), truck fuel use
  (L/100 km), and derived round trips.
- Adds a fuel estimate to the final price using the current distance and diesel
  price, so the quote reflects today's travel cost.
- Shown switched on in the mockup to demonstrate the effect.

### Explaining the jargon
- The UI should not assume the user remembers terms like swell.
- Add plain-English explanations in the interface: swell (material expands when
  dug), settling (delivered material compacts), volume-only, and rounded trucks.
- Prefer descriptive labels over bare jargon, e.g. "Apply swell (material
  expansion)" and "Settling allowance".

### Saved jobs (added during discussion)
- Jobs can be **saved**, named, and loaded again later.
- Start-up offers **New** or **Load**; within a job there are New / Save / Load
  controls.
- The job name/address is optional. If left blank when saving, the job is saved
  with an automatic timestamp name (e.g. "Job - 24 Oct 2026, 10:46") and can be
  renamed later - no interrupting prompt required.
- Load shows saved jobs newest first, with name, date and result summary; loading
  replaces the current job. Jobs can be deleted from the list.
- New starts a blank job; if there are unsaved changes, confirm before discarding.
- **Native apps:** jobs are saved as plain JSON in the OS app data folder and stay
  on that device.
- **Docker web app:** jobs are saved as plain JSON in the Docker data folder and
  are shared by all LAN users.
- No cloud, no internet sync and no accounts.

### Data and sharing (added during discussion)
- Native and Docker job lists are separate in v1. There is no automatic sync
  between them.
- Docker stores one pretty-printed JSON file per job. No SQLite and no database
  server.
- Writes are atomic, and deleted jobs move to a trash folder instead of being
  erased immediately.
- Docker sharing is LAN only. No PIN and no accounts. The network is expected to
  be trusted, with firewall rules preventing access from the internet.
- If two users edit the same job at the same time, the last save wins. Different
  jobs and new jobs do not conflict.
- Backups are a matter of copying the Docker data folder or the native app data
  folder.

### Output
- Fractional truck count (e.g. 1.5 trucks) and price (rate × trucks).
- Optional **Round up** toggle: rounds the truck count up (1.5 → 2), updates the
  price accordingly, and still shows the exact decimal alongside the rounded
  figure - e.g. `1.5 (rounded to 2)`.
- One-line plain-language summary plus the price.

### GST
- Single selector rather than two checkboxes: **No GST / Add 10% /
  Prices include 10%**. Defaults to No GST; rate editable in settings.
- GST is optional because the tool is internal.

## Tech Stack (confirmed)
- **Frontend:** plain HTML, CSS and JavaScript. No framework, no build step and
  no npm.
- **Native apps:** Tauri 2 with Rust, built through Cargo. Offline only.
- **Native storage:** a small Rust storage bridge writes pretty-printed JSON to
  the OS app data folder:
  - Windows: `%APPDATA%\quote-assistant\`
  - Linux: `~/.config/quote-assistant/` for settings and
    `~/.local/share/quote-assistant/` for jobs
  - Android: the app's private data directory
- **Docker:** one tiny Node server using only built-in modules
  (`node:http`, `node:fs`, `node:path`, `node:crypto`). It serves the web app and
  the JSON API. No nginx, no SQLite and no npm.
- **Docker data:** `docker/data/jobs/*.json`, one file per job, with atomic writes
  and a trash folder for deletes. The data folder is mounted into the container
  and excluded from git.
- **Browser test build:** falls back to `localStorage` when opened directly or
  served without the Docker API.
- All assets are bundled. No remote fonts, scripts or runtime network calls.

### Testing (confirmed)
- `tests/tests.html` opens by double-click and includes a manual sandbox for
  trying measurements, plus pass or fail results for the calculation functions.
- The same checks run in the terminal with `node tests/run-tests.js`.
- The Docker server gets a small test script using Node's built-in test runner,
  with no packages.
- Manual smoke checks cover the browser app, the Docker LAN app and the Tauri
  native builds.

## Open Questions
- Android only, or iOS eventually? (iOS builds require a macOS host; not possible
  from the current Linux setup.)
- One truck type per job, or switchable saved truck presets?
- Currency assumed AUD (`$`). Confirm.
- Real-world swell / voids / bulk-density numbers to seed the material presets.
- For bring-in material: is the amount derived from area × depth, entered
  directly, or both? Does delivered material need a compaction/settling factor?
- For bring-in material: is the truck rate charged on delivery trips as well as
  the material price, or does the material price include delivery?
- Custom delivery fee: does it replace only the calculated delivery trip cost,
  or the entire Material In total including the material price?
- Fuel estimate: confirm the formula (total trucks × one-way distance × 2 ×
  fuel use ÷ 100 × diesel price) and the default fuel-use figure, or make it a
  saved setting.
- Should Docker mode share material and truck presets through the server, or keep
  settings local to each browser and device?

## Additional Suggestions (candidate - not committed)
- **Capacity margin**: a "comfortable fit" factor (default 90-95% of capacity) so
  the app leans toward an extra truck rather than an overloaded one.
- **Truck presets**: save named trucks ("Tipper - 8 t / 6.5 m³") and pick one per
  job; remember the last used.
- **Material preset table**: topsoil, sand, gravel, crushed rock, clay, concrete
  rubble - each with loose density, swell and voids, all editable.
- **Show the maths**: expandable breakdown per section (`10 × 3 × 0.1 = 3 m³`,
  `+30% swell = 3.9 m³`) so the number can be trusted and checked.
- **Autosave the current job** locally so an accidental close doesn't lose it.
- **Job search / filter** once there are many saved jobs; show recent jobs on the
  start-up screen.
- **JSON export/import** for manual backup and moving between devices offline.
- **Copy summary** to clipboard (text only) for pasting into a note or message.
- **Price rounding display** option: nearest $1 / $5 / $10.
- **Validation and warnings**: zero/negative dimensions, weight over capacity,
  missing truck size, assumed-depth warnings.
- **Touch-friendly UI**: large targets, numeric keypads on mobile, readable in
  sunlight, dark theme.
- **Optional PWA install** if the Docker build is later served over HTTPS. A plain
  LAN HTTP address cannot reliably cache the app for offline use.
- **Docker backup helper**: a small script or documented command that zips the
  data folder for a manual backup.
- **No INTERNET permission** on Android and network capability disabled in Tauri;
  bundle fonts and icons.
- **Per-section notes/labels** ("front yard", "driveway") to keep jobs readable.
- **Duplicate section** and **undo** for fast repeated measurements.
