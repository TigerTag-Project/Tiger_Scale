# Changelog

All notable changes to **TigerScale** are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
- **Web Installer** at `https://tigertag-project.github.io/TigerScale/` (ESP Web Tools)
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
[TigerTag-Scale](https://github.com/TigerTag-Project/TigerTag-Scale) (v1.x)
project. The 1.x series supported a single RFID reader, no servo, and used a
Cloud Function for weight sync. Major changes from 1.x:

- Single → dual RFID
- Added servo for active tag discovery
- Switched from Cloud Function to direct Firestore REST API
- Added Google Sign-In
- Refactored web UI

[Unreleased]: https://github.com/TigerTag-Project/TigerScale/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/TigerTag-Project/TigerScale/releases/tag/v2.0.0
