# Changelog

All notable changes to **TigerScale** are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.2.0] — 2026-05-11 — Firestore server timestamp, heartbeat delta mode, NTP sync

### Added

#### Firmware
- **Firestore server timestamp** — `last_heartbeat_at` is now written by the Firestore server
  via `setToServerValue: "REQUEST_TIME"` (commit API). The ESP32 no longer needs to know the
  current time to produce accurate heartbeat timestamps.
- **NTP sync** — `configTime("pool.ntp.org")` called after WiFi connect; used by the inventory
  update timestamp (`updateScaleLastSpool`) when Firestore server time is unavailable.
- **Heartbeat delta mode** — `sendScaleHeartbeat()` now sends a **FULL** snapshot only on boot
  or after a new account login (14 fields), and a lightweight **delta** PATCH every 30 s
  thereafter (only `wifi_signal_dbm` + fields that changed: UID, IP, calibration factor).
  Reduces Firestore write volume and SSL round-trips.
- **Force full heartbeat on account login** — when a new Firebase token is stored via
  `/api/firebase/token`, the next heartbeat tick immediately sends a full snapshot.
- **`refresh_heartbeat` command** — OTA command queue supports `type: "refresh_heartbeat"`,
  which triggers a full Firestore snapshot on the next tick (useful for Studio to force a sync).

### Changed

#### Firmware
- `sendScaleHeartbeat()` switched from `PATCH documents/{path}?updateMask=…` to
  `POST documents:commit` with an `updateTransforms` entry for `last_heartbeat_at`.
- Heartbeat now sends `calibration_factor`, `ip_address`, and `mdns_hostname` in addition to
  the previous fields.
- `StaticJsonDocument<512>` in heartbeat replaced with `DynamicJsonDocument(2048)` to
  accommodate the commit payload structure.

### Removed

#### Firmware
- Dead code `getTimestampMs()` — superseded by server timestamp; removed.

---

## [2.1.0] — 2026-05-09 — Local RFID DB, WebSocket delta compression, workflow badge

### Added

#### Firmware
- **Local TigerTag brand/material DB** — `id_brand.json` and `id_material.json` are stored in
  LittleFS and loaded into RAM at boot (`std::map<uint16_t,String>`). RFID lookups are now
  instant (no HTTP) and never block the weight display loop.
- **Automatic DB version check** — on boot and every 24 h, the firmware fetches
  `last_update.json` from GitHub and updates only the files whose timestamp changed
  (same algorithm as the official Python script). Manual trigger via `POST /api/update-db`.
- **DB status indicator** in the web UI header — coloured dot + text shows whether the DB is
  loaded, up-to-date, stale, or currently updating.
- **Workflow state badge** — semi-transparent pill overlaid top-left of the weight card
  (`position: absolute`) so card height never changes. States:
  `📡 Scanning RFID` · `⚖️ Stabilizing` · `⏳ Sending` · `✅ Sent` · `🗑️ Remove Spool` · `🟢 Ready for next spool`
- **"Ready for next spool" permanent badge** — shows after spool removal and stays until the
  next spool is placed (not dismissed by a timer).
- **WebSocket delta compression** — `buildWsFrame()` tracks last-sent values; only changed
  fields are included in each 100 ms broadcast. Full snapshot sent on connect and every 30 s.
  Broadcast skipped entirely when nothing changed.

### Fixed

- **RFID scan no longer freezes the weight display** — brand/material resolved from local RAM
  instead of two blocking HTTP GETs (~4.5 s each) on Core 1.
- **Post-send re-scan bug** — after a successful send, the weight settled slightly during the
  ~5 s async Firebase call. The residual negative slope triggered `removingNow`, causing
  `WF_DONE → WF_IDLE` in one tick and immediately re-starting the RFID scan with the spool
  still on the scale. Fixed by: (1) resetting the slope buffer when entering `WF_DONE`,
  (2) removing `removingNow` from the `WF_DONE` exit condition.
- **"Ready for next spool" badge invisible** — the old 70 % weight threshold triggered
  `WF_DONE → WF_IDLE` mid-removal (e.g. at 600 g), causing `WF_IDLE` to immediately start
  scanning and overwrite the badge within 100 ms. Changed threshold to `SPOOL_REMOVED_WEIGHT_G`
  (50 g) so the transition only fires when the scale is truly empty.
- **Spool / Filament row always visible** — removed `display:none`; shows `—` when no value.

## [2.0.0] — 2026-05-05 — First public release

This is the first public, open-source release of TigerScale.

### Added

#### Hardware features (vs prototype V1)
- **Dual RC522 RFID readers** on a shared SPI bus (GPIO 5/14 SS, 27/25 RST)
- **Continuous servo** (FS90R) on GPIO 26 for spool rotation
- 3D-printable enclosure (`hardware/3d-models/`)

#### Firmware features
- **Firebase Google Sign-In** via OAuth bridge (`/api/firebase/token` endpoint)
  — passwords are never stored on the device
- **Refresh-token-only auth** — `isFirebaseConfigured()` accepts a refresh token
  alone, sessions persist across reboots without a password
- **Twin-tag pairing** decision matrix (§6.1 spec) — auto-discovers and pairs
  spools with two RFID tags
- **Auto-tare** in the 0.5–50 g range after spool removal
- **EMA + median filtering** with hysteresis for stable readings
- **Automatic container-weight subtraction** — net weight only
- **Real-time Firestore sync** via REST API (no Cloud Function dependency)
- **Heartbeat** every 30 s (Wi-Fi RSSI, current spool UIDs, fw_version)
- **Rack location tracking** (id, level, position) with formatted display (e.g. "A6")

#### Web UI
- **Modern login modal** with Google + email/password, mobile-friendly
- **Account card** with avatar, email, sign-out button (visible only when authenticated)
- **WebSocket live weight** at `/ws`
- **Calibration wizard** with masterspool presets (BambuLab, R3D, Custom)
- **Multilingual** UI (English / French)
- **PWA support** — installable on mobile

#### Cloud / OAuth
- **OAuth bridge** page (`scale-auth.html`) hosted on Firebase Hosting (`tigertag-cdn.web.app`)
- **Origin whitelist** validation (RFC 1918 + `tigerscale-XXXX.local`)
- **postMessage** secure delivery of tokens to the device

#### Documentation
- English `README.md` with architecture, quick-start, BoM
- `docs/HARDWARE.md`, `docs/INSTALLATION.md`, `docs/FIRMWARE.md`,
  `docs/FIREBASE_SETUP.md`, `docs/TROUBLESHOOTING.md`
- `hardware/BOM.md` with vendor links
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`
- GitHub Actions CI to compile firmware on every PR

#### Tooling
- **PlatformIO** project (`platformio.ini`, `partitions.csv`)
- **Web Installer** at `https://tigertag-project.github.io/Tiger-Scale/` (ESP Web Tools)
- Cross-platform build scripts (`scripts/build_littlefs.sh`)
- `.gitattributes` for consistent LF line endings

### Changed
- Repository structure reorganised for public release:
  - `firmware/TigerTag_Scale_V2.ino` → `src/main.cpp` (PlatformIO-friendly)
  - `web/data/` → `data/`
  - `Stl Files/` → `hardware/3d-models/` (lowercase, underscored names)
- README rewritten in English (was Portuguese in 2.0.0-rc)

### Security
- No telemetry, no analytics on the device
- `.gitignore` excludes `secrets.h`, `firebase_config.h`, `serviceAccountKey.json`
- OAuth bridge enforces strict origin whitelist (LAN-only)
- Firestore security rules restrict each user to their own `users/{uid}/...`

---

## Pre-2.0.0 history

This repository is a continuation of the original
[TigerTag-Scale V1](https://github.com/TigerTag-Project/Tiger-Scale/tree/legacy-v1) (v1.x)
project. The 1.x series supported a single RFID reader, no servo, and used a
Cloud Function for weight sync. Major changes from 1.x:

- Single → dual RFID
- Added servo for active tag discovery
- Switched from Cloud Function to direct Firestore REST API
- Added Google Sign-In
- Refactored web UI

[Unreleased]: https://github.com/TigerTag-Project/Tiger-Scale/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/TigerTag-Project/Tiger-Scale/releases/tag/v2.0.0
