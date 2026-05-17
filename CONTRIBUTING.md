# Contributing to TigerScale

Thank you for your interest in TigerScale! This document explains how to contribute code, documentation, hardware designs, or translations.

## Table of contents

- [Code of Conduct](#code-of-conduct)
- [How can I contribute?](#how-can-i-contribute)
- [Development setup](#development-setup)
- [Coding style](#coding-style)
- [Submitting a pull request](#submitting-a-pull-request)
- [Reporting bugs](#reporting-bugs)
- [Asking for help](#asking-for-help)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behaviour to the maintainers.

## How can I contribute?

There's a contribution path for every skill level:

| Skill | Where to start |
|---|---|
| 💻 Firmware (C++ / Arduino) | `src/main.cpp` — clean up state machines, fix RFID timing, add features |
| 🌐 Web UI (HTML/CSS/JS) | `data/www/` — refine the calibration wizard, mobile UX, accessibility |
| 🏗️ 3D design (CAD) | `hardware/3d-models/` — better case, parametric models, alt designs |
| 📚 Documentation | `docs/`, `README.md`, `hardware/BOM.md` |
| 🌍 Translation | `data/www/script.js` — `translations.fr` / `translations.en` |
| ☁️ Cloud (Firebase) | Help improve `FIREBASE_SETUP.md`, security rules, optional Cloud Functions |
| 🐛 Testing | Build a TigerScale at home, file detailed bug reports |

## Development setup

### Prerequisites

- **PlatformIO** (recommended) — `pip install platformio` or use the [VS Code extension](https://platformio.org/install/ide?install=vscode)
- **Git** + a GitHub account
- An **ESP32 dev board** + the [hardware listed in BOM.md](hardware/BOM.md) (helpful but not required for UI/docs work)
- For UI work, any modern browser with **Chrome DevTools** or **Firefox** dev tools

### Clone and build

```bash
git clone https://github.com/TigerTag-Project/Tiger-Scale.git
cd Tiger-Scale
pio run                    # compile firmware
pio run -t buildfs         # build the LittleFS image (web UI)
```

### Flash to your device

```bash
pio run -t upload          # firmware
pio run -t uploadfs        # web UI
pio device monitor         # serial console (115200 baud)
```

### Web UI iteration loop

The web UI lives in `data/www/`. You don't need to flash the ESP32 to iterate — open `index.html` directly in your browser, but mock the API responses (use a local JSON server or modify the `fetch` calls).

For a real test, after every change:

```bash
pio run -t buildfs && pio run -t uploadfs
```

Then hard-refresh your browser (`Cmd+Shift+R` / `Ctrl+Shift+R`) to bypass the service worker cache.

## Coding style

### C++ / Arduino (`src/main.cpp`)

- **Indentation** : 4 spaces, no tabs
- **Naming** :
  - Functions / variables : `camelCase` (`firebaseSignIn()`, `lastUID`)
  - Constants : `UPPER_SNAKE_CASE` (`HEARTBEAT_INTERVAL_MS`)
  - Pin defines : `UPPER_SNAKE_CASE` (`HX711_DOUT`)
- **Comments** : Use `//` for short explanations, `/* */` for sections. Use `[TAG]` prefixes in `Serial.printf` for log filtering: `[BOOT]`, `[FIREBASE]`, `[WEIGHT]`, etc.
- **Avoid** : `delay()` over 50 ms in `loop()` (use `millis()` patterns), magic numbers (use named constants)
- **Memory** : prefer `StaticJsonDocument<N>` for known-small payloads, `DynamicJsonDocument` for variable / large

### JavaScript (`data/www/script.js`)

- **Indentation** : 4 spaces
- **Naming** : `camelCase` for functions/variables, no semicolon-style preferences (project uses semicolons)
- **DOM** : prefer `getElementById` over `querySelector` for direct lookups
- **Translations** : every user-facing string must be added to BOTH `translations.fr` and `translations.en`. Use `t('key')` to retrieve.
- **Network** : all `fetch` calls must handle errors and show user feedback (no silent failures)

### CSS (`data/www/styles.css`)

- Mobile-first
- Use BEM-ish class names (`.auth-btn`, `.auth-btn-google`, `.auth-btn-primary`)
- Custom properties (`--orange`, `--bg`) for theming
- Avoid `!important` unless overriding library CSS

## Submitting a pull request

1. **Fork** the repo and create a feature branch:
   ```bash
   git checkout -b feature/my-cool-feature
   ```
2. **Make your changes** with clear, atomic commits:
   ```
   feat(firmware): add /api/firebase/token endpoint for OAuth bridge
   fix(ui): correct sign-in modal layout on iOS Safari
   docs(hardware): add wiring diagram for HX711
   ```
   We loosely follow [Conventional Commits](https://www.conventionalcommits.org/).
3. **Test locally** — at minimum `pio run` must succeed
4. **Push** to your fork and open a PR against `main`
5. **Describe** what your PR does and why; include screenshots for UI changes
6. **Address review feedback** — we aim to respond within a week

The CI will compile your firmware automatically. PRs that don't compile won't be merged.

## Reporting bugs

Open a [GitHub issue](https://github.com/TigerTag-Project/Tiger-Scale/issues/new/choose) using the **Bug Report** template. Include:

- **What you expected** vs **what happened**
- Steps to reproduce
- Hardware (ESP32 model, RFID/HX711 modules)
- Firmware version (visible on OLED at boot, or in `/api/status`)
- Serial logs (run `pio device monitor` while reproducing) — paste relevant lines, not 1000-line dumps
- Wi-Fi setup (which router, mDNS issues, etc.)

For UI bugs, also include:
- Browser + OS
- Screenshots or screen recording
- Browser console errors (DevTools → Console)

## Asking for help

- 💬 [Discord](https://discord.gg/3Qv5TSqnJH) — fastest way for real-time help
- 🐛 [GitHub Issues](https://github.com/TigerTag-Project/Tiger-Scale/issues) — bugs and feature requests
- 📚 [Documentation](docs/) — start here for setup / hardware questions

---

Thank you for making TigerScale better! 🐯
