# Quote Assistant

A local-first, privacy-first estimator for earthmoving quotes. Native builds run
fully offline; the Docker build stays on the local network. Used internally on the
spot while measuring a job; the customer never sees the output.

UI mockup (design reference): [`mockups/quote-assistant-ui.html`](mockups/quote-assistant-ui.html)

## Current Implementation
- Working estimator: `app/index.html`.
- Calculation engine: `app/calc.js`.
- Manual test sandbox: `tests/tests.html`.
- Terminal tests: `node tests/run-tests.js`.
- Working: section shapes, swell, truck loads, truck presets, price, rounding, GST, Material In, delivery pricing, travel and fuel, combined totals, warnings and the browser UI.
- Not yet built: material presets, job save and load, uneven fill areas, multiple materials, native packaging and Docker sharing.

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
- Spoil uses volume capacity only in the current UI.
- Weight capacity remains editable and is used for material delivery.
- The calculation engine still supports volume, weight, or both for spoil, but
  the Weight and Both spoil tabs are hidden for now and can return later.
- Reference truck: roughly 8 t and 6.5 m³, both editable.
- Price is entered **per truck** and scales with the number of trucks.
- Optional fuel consumption is stored in km/L.

### Truck presets (implemented)
- Named presets store volume capacity, weight capacity, price per truck and
  optional fuel consumption.
- Multiple trucks are supported.
- Selecting a preset loads its values. Editing does not overwrite the preset
  until Save is used.
- Keeping the same name on Save updates the selected preset. Changing the name
  creates a new preset, leaving the old one intact.
- Presets are stored locally with a versioned schema.
- Docker will share presets with LAN users in the Docker milestone.
- Saved jobs will store the truck values themselves, not only a preset ID, so
  editing a preset later does not change an old quote.

### Job structure
- A job is modular: multiple sections, each added with an "Add More" button.
- Each section has a shape mode and a material choice.
- **Rectangle:** width × length × depth. This is the default.
- **Uneven ends:** width across, left length, right length and depth. The area
  uses the average of the two ends.
- **Manual area:** area in m² × depth.
- **Manual volume:** enter the volume in m³ directly.
- Sections are independent and can be added, duplicated, removed, and reordered.
- For L-shapes and other complex outlines, split the area into multiple sections
  or use manual area.

### Materials and density
- Spoil is volume-only in the current UI.
- Section material density is not exposed; the engine still supports it for
  possible future use.
- Material In has its own density field for delivery weight checks.
- Material presets are still planned. Presets will carry loose bulk density,
  swell %, and (for rubble) a voids %.
- Concrete removal needs void/air-gap handling, not just solid density.

### Swell / bulking
- Excavated material expands; in-ground volume is not truck volume.
- Swell is applied per job via a checkbox plus a % input, **off by default**.
- Presets may suggest a swell figure, but it stays off until enabled.

### Units
- Units are per field, not one global unit.
- Defaults: footprint dimensions in metres, depth in millimetres.
- Each field offers m / cm / mm; truck volume in m³ and weight in tonnes.

### Uneven areas and missing depth
- The old assumed-depth option is removed.
- Depth is required for rectangle, uneven ends and manual area. If depth is
  missing, the section still shows its area, but volume cannot be calculated and
  the result warns about the missing depth.
- Manual volume is the fallback when the volume is already known.
- Uneven ends assumes the left and right ends are parallel and that the width is
  measured across, square to those ends.
- Four side lengths alone do not determine the area of a general quadrilateral.
  A four-sides-plus-diagonal mode is a possible later addition.
- Complex outlines should be split into multiple sections or entered as manual
  area.

### Bring-in material (implemented)
- Some jobs also require material to be brought **to** the site, not just spoil
  removed.
- A per-job toggle ("Bringing material to site?") reveals the Material In card.
- One material entry per job in v1.
- Amount methods: direct volume (m³), direct weight (tonnes), or area × depth.
- Direct volume and area × depth use a settling allowance to convert finished
  fill into loose delivered volume. Direct volume can choose whether to apply
  the allowance. Area × depth always applies it.
- Direct weight is entered in tonnes and has no settling allowance.
- Material price is per m³ for volume and area, and per tonne for weight.
- Optional density is used for weight limits and unit conversion.
- Delivery uses the capacity that matches the material amount: weight for direct
  weight, volume for volume and area, and both when density makes both known.
  This is independent of the spoil capacity mode.
- Delivery pricing options:
  - Custom delivery fee (default).
  - Use the main truck rate.
  - Delivery included in the material price.
- A custom delivery fee overrides the calculated delivery trip cost only. The
  material cost stays separate.
- Spoil and delivery trips are treated as separate trips in v1.
- Combined trucks are spoil trucks plus delivery trucks.
- Combined price is spoil price plus material cost plus delivery trip cost.
- GST is applied to the combined charge.
- Area × depth is a rectangle in v1. Use direct volume for irregular fill areas.
- Multiple materials and uneven fill areas are later additions.

### Travel and fuel (implemented)
- Optional toggle below Material In, disabled by default.
- Inputs:
  - Distance from the job in km.
  - Round trip toggle. When checked, the distance is doubled. When unchecked,
    the entered distance is used as the total trip distance.
  - Trips: use the job truck total, or enter a manual trip count.
  - Cost method: fuel consumption, or price per km.
  - Fuel mode: fuel consumption in km/L from the truck preset or a manual value,
    plus an optional diesel price in $/L. The diesel input accepts cents and
    shows two decimal places. If diesel is excluded, the app shows fuel litres
    only.
  - Price-per-km mode: a fixed price per km in dollars. This is useful when the
    truck's fuel consumption is unknown.
- The trip count uses combined spoil and delivery trucks.
- Trip counts are whole numbers. The job truck total and manual trips are both
  rounded up before calculating travel.
- Fuel cost = total km ÷ km/L × diesel price.
- Price-per-km cost = total km × price per km.
- Travel cost is added to the combined total before GST.
- Warnings cover missing distance, fuel consumption, diesel price, price per km
  and trips.
- The truck preset's fuel consumption is the default for the job, but it can be
  overridden in the travel section.
- For multi-stop routes, enter the actual total route distance and turn off the
  round trip toggle. The app does not model individual stops.

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
- The same checks run in the terminal with `node tests/run-tests.js`, together
  with the truck preset storage tests.
- The Docker server gets a small test script using Node's built-in test runner,
  with no packages.
- Manual smoke checks cover the browser app, the Docker LAN app and the Tauri
  native builds.

## Open Questions
- Android only, or iOS eventually? (iOS builds require a macOS host; not possible
  from the current Linux setup.)
- Currency assumed AUD (`$`). Confirm.
- Real-world swell / voids / bulk-density numbers to seed the material presets.
- Should spoil and delivery trips be combinable, where the same truck can return
  with material? Currently they are separate trips.
- Should fill areas support uneven ends and manual area, or is rectangle plus
  direct volume enough?

## Additional Suggestions (candidate - not committed)
- **Capacity margin**: a "comfortable fit" factor (default 90-95% of capacity) so
  the app leans toward an extra truck rather than an overloaded one.
- **Material preset table**: topsoil, sand, gravel, crushed rock, clay, concrete
  rubble - each with loose density, swell and voids, all editable.
- **Autosave the current job** locally so an accidental close doesn't lose it.
- **Job search / filter** once there are many saved jobs; show recent jobs on the
  start-up screen.
- **JSON export/import** for manual backup and moving between devices offline.
- **Copy summary** to clipboard (text only) for pasting into a note or message.
- **Price rounding display** option: nearest $1 / $5 / $10.
- **Validation and warnings**: zero/negative dimensions, weight over capacity,
  missing truck size and missing depth warnings.
- **Four sides plus diagonal** for exact irregular quadrilateral areas, if real
  jobs need more than uneven ends or manual area.
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
