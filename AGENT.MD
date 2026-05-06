# AGENT.MD

Reference for AI coding agents (Claude, Codex, Cursor, Aider…) working on this
repository. Read this BEFORE diving into the codebase — it will save you time
and tokens.

## What this is

**TigerScale** is an open-source IoT scale for 3D-printer filament spools.
Hardware: ESP32 + 2× RC522 RFID + HX711 load cell + SSD1306 OLED + FS90R servo.
Cloud: Firebase (project `tigertag-connect`) for inventory sync.

## Architecture in 60 seconds

```
[Hardware]  ESP32 ──┬─ 2× RC522 (SPI shared, GPIO 5/14 SS, 27/25 RST)
                    ├─ HX711  (GPIO 32/33)        weight
                    ├─ OLED   (I²C 21/22)         status
                    └─ Servo  (GPIO 26)           rotates spool

[Firmware]  src/main.cpp (~3500 l, single Arduino-style file, PlatformIO)
            Web UI served from LittleFS. REST API + WebSocket on port 80.

[Web UI]    data/www/  (HTML + script.js + i18n.js + 9 locales/*.json)
            Modal Firebase login (Email + Google OAuth bridge), Account card.

[Cloud]     Firebase Auth + Firestore  (separate repo: TigerTag_Firebase_Backend)
            OAuth bridge at https://tigertag-cdn.web.app/scale-auth.html
            Per-user docs: users/{uid}/{scales,inventory,racks,commands}/...

[Web Inst]  web-installer/  (ESP Web Tools, hosted on GitHub Pages)
            Auto-deployed on every push to main via .github/workflows/.
            Live URL: https://tigertag-project.github.io/Tiger_Scale/
```

## Repo layout

```
src/main.cpp              firmware (single .cpp, sections separated by banners)
data/www/                 device web UI (LittleFS, served from port 80)
  ├─ i18n.js              i18n controller, exposes window.t() / setLanguage()
  └─ locales/{lang}.json  9 locales (en/fr/de/es/it/pl/pt/pt-pt/zh)
web-installer/            ESP Web Tools landing page + auto-built binaries
  ├─ i18n.js              same controller pattern
  ├─ locales/             same 9 locales
  └─ firmware/*.bin       NOT committed — built by CI on every push
docs/                     english docs (HARDWARE, INSTALLATION, FIRMWARE,
                          FIREBASE_SETUP, TROUBLESHOOTING)
hardware/3d-models/       STL files (case, bottom-plate, weighing-platform,
                          servo-gear, rfid-antenna-mount, rfid-antenna-base)
hardware/BOM.md           bill of materials with vendor links
.github/workflows/        build.yml (PR check) + deploy-installer.yml (Pages)
platformio.ini            PIO build config
partitions.csv            ESP32 partition table (4 MB, dual app + 896 KB FS)
```

## Hard rules — DO and DON'T

### DO
- Use the i18n token system. Strings → `t('key')` + add to `locales/{en,fr}.json`.
  Never hardcode user-facing text inline. Other locales are best-effort
  (EN fallback ensures no raw keys leak).
- Use **SVG icons** via CSS mask-image / `<use href="#icon-x">`. No emojis in UI.
- Use Lucide-style stroke icons (`stroke="currentColor" stroke-width="2"`)
  so they inherit color from CSS.
- Run `pio run` before committing firmware changes.
- Follow conventional commits (`feat(scope):`, `fix(scope):`, `refactor:`,
  `docs:`, `ci:`).
- Keep PROGMEM for big embedded strings (`R"PREFIX(...)PREFIX"`).
- Verify the LittleFS budget: `pio run -t buildfs` must succeed
  (E0000 = 896 KB max).

### DON'T
- **No emojis** in any user-facing place (captive portal, web UI, OLED).
  This is a hard requirement — the user has told us multiple times.
- Don't add `delay()` > 50 ms in `loop()` — kills WebSocket/RFID polling.
- Don't commit firmware binaries in `web-installer/firmware/*.bin` — they
  are built by CI on every push (already gitignored).
- Don't add Firebase passwords to NVS — refresh tokens only.
- Don't use ArduinoJson v7 — pinned to v6 in `platformio.ini`.
- Don't blindly bump `actions/*` versions; check they exist via
  `gh api repos/actions/<name>/releases`.
- Don't push `master` — the branch is `main` (legacy v1 is preserved at
  `legacy-v1` for history).

## Build & flash commands

```bash
# Compile firmware
pio run

# Build LittleFS image (data/www → littlefs.bin)
pio run -t buildfs

# Flash firmware to ESP32 (auto-detect port)
pio run -t upload

# Flash filesystem to ESP32
pio run -t uploadfs

# Serial monitor (115200 baud)
pio device monitor

# Helper scripts (cross-platform)
./scripts/build_littlefs.sh
./scripts/flash.sh /dev/cu.usbserial-XXX
```

Current usage: Flash ~83 %, RAM 16 %, LittleFS ~25 %. Plenty of headroom for
~270 KB more code and ~600 KB more web assets.

## Where to look for X

| Need to change… | Look at… |
|---|---|
| Firebase auth flow | `src/main.cpp` § FIREBASE AUTHENTICATION (~l. 500) |
| OTA logic | `src/main.cpp` § OTA — Over-the-air (~l. 3000) |
| Firestore command listener | `src/main.cpp` § Firestore command queue listener |
| REST endpoints (`/api/*`) | `src/main.cpp` § WEB SERVER — `setupWebServer()` |
| Captive portal CSS | `src/main.cpp` § CAPTIVE_PORTAL_HEAD constant |
| Dual RFID polling | `src/main.cpp` § RFID + `loop()` step 1 |
| Twin-tag pairing logic | `src/main.cpp` § `updateScaleLastSpool()` (matrix §6.1) |
| Auto-tare | `src/main.cpp` § `processAutoTare()` |
| Servo state machine | `src/main.cpp` § `updateServoWorkflow()` |
| Web UI structure | `data/www/index.html` |
| Web UI behaviour / i18n shim | `data/www/script.js` |
| Add a language | drop `data/www/locales/{code}.json` + add entry in `LANGS` of `i18n.js` |
| OAuth bridge (Firebase Hosting) | external repo: `TigerTag_Firebase_Backend/public/scale-auth.html` |
| GitHub Pages config | `.github/workflows/deploy-installer.yml` |

## Cloud bridge (read-only context for the device repo)

The OAuth bridge for Google Sign-In lives in a separate repo:
**`TigerTag_Firebase_Backend`** (Firebase Hosting target `cdn` →
`https://tigertag-cdn.web.app`). It is **not** part of this repo. The device
opens it as a popup; tokens come back via `postMessage` with origin whitelist
(LAN-only RFC1918 + `tigerscale-XXXX.local`).

Project ID `tigertag-connect` is **hardcoded** in firmware Firestore URLs.
This is intentional (Yoto-style: open hardware, centralised cloud). To
self-host: see `docs/FIREBASE_SETUP.md` § Self-hosted.

## I18n cheat sheet

Everywhere we render user-facing text, we use:

```html
<span data-i18n="myKey">English fallback</span>
<input data-i18n-placeholder="myKey" placeholder="...">
<button data-i18n-title="myKey" title="...">          <!-- icon-only button -->
<meta name="description" data-i18n-attr-content="metaDesc" content="...">
```

```js
const msg = t('myKey');           // simple lookup, EN fallback
t('greet', { name: 'Ben' });      // {{var}} interpolation
```

To add a key, edit BOTH `locales/en.json` and `locales/fr.json` minimum. Other
locales are best-effort and fall back to EN automatically.

The 9 locale codes (matched across this repo + Tiger Studio + web installer):
`en  fr  de  es  it  pl  pt  pt-pt  zh`.

## Commit / PR conventions

```
feat(firmware): add /api/ota/check
fix(ui):        modal layout broken on iOS Safari
refactor:      split main.cpp into modules
docs(hardware): add wiring diagram for HX711
ci:            bump actions to Node 24
```

CI runs `pio run` on every PR — must pass before merge.

## What NOT to "fix" without asking

- The captive portal Apple-style design (no emojis, SVG masks, dropdown
  switcher) was crafted iteratively by the user. Don't refactor it
  unprompted.
- The `pt` (Brazilian) vs `pt-pt` (Portugal) split — same as Tiger Studio.
  Don't merge them.
- The `tigertag-connect` Firebase project ID is hardcoded on purpose.
  Don't try to make it configurable without explicit user approval.
- The `/api/firebase/auth` (email/password) AND `/api/firebase/token` (Google
  bridge) endpoints both exist on purpose — don't remove either.

## Token-saving tips (for the agent reading this)

- Read this file first, then jump straight to the section you need.
- Use `Read` with `offset/limit` on `src/main.cpp` instead of reading the
  whole 3500-line file.
- Use `grep -n` to locate symbols, then read 30 lines around the hit.
- Use `Edit` (diff) instead of `Write` (full rewrite) when modifying files
  > 50 lines.
- Pipe `pio run` output through `tail -10` — full output is 500+ lines of noise.

---

Last updated: 2026-05-06.
