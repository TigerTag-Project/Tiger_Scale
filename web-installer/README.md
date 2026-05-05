# Web Installer

Browser-based ESP32 flasher for TigerScale, powered by [ESP Web Tools](https://esphome.github.io/esp-web-tools/).

## Live URL

This folder is published on GitHub Pages at :

👉 **<https://tigertag-project.github.io/TigerScale/>**

## How it works

1. The user visits the URL above in **Chrome / Edge / Brave / Opera**
2. The page loads `manifest.json` which references 5 binary files :
   - `bootloader.bin` (offset `0x1000` = 4096)
   - `partitions.bin` (offset `0x8000` = 32768)
   - `boot_app0.bin` (offset `0xE000` = 57344)
   - `firmware.bin` (offset `0x10000` = 65536, OUR build)
   - `littlefs.bin` (offset `0x310000` = 3211264, OUR data)
3. The user clicks "Install"
4. ESP Web Tools uses the [Web Serial API](https://web.dev/serial/) to flash all 5 binaries in sequence

## Updating the binaries — fully automatic

⭐ Binaries are **never committed** to this repo. They are rebuilt fresh on every
push to `main` by `.github/workflows/deploy-installer.yml`, which then deploys
the entire `web-installer/` folder (HTML + JS + freshly-built `.bin`s) to
GitHub Pages.

```
git push (any code change in src/ or data/)
        │
        ▼
  CI builds firmware + LittleFS
        │
        ▼
  Binaries staged into web-installer/firmware/
        │
        ▼
  https://<owner>.github.io/<repo>/  ← updated in ~3-4 min
```

The published page **always serves the latest commit**, no manual action.

## One-time GitHub Pages setup

After your first push to `main` :

1. Repo → **Settings → Pages**
2. **Source** : `GitHub Actions` (NOT "Deploy from branch")
3. Save

The next push will trigger the deploy. Subsequent pushes update the site automatically.

## Local testing

If you want to test the Web Installer locally before pushing :

```bash
# Build the binaries once
pio run
pio run -t buildfs

# Copy them where the installer expects
mkdir -p web-installer/firmware
cp .pio/build/esp32dev/{firmware,bootloader,partitions,littlefs}.bin web-installer/firmware/
cp ~/.platformio/packages/framework-arduinoespressif32/tools/partitions/boot_app0.bin web-installer/firmware/

# Serve the folder
cd web-installer && python3 -m http.server 8765
# → http://localhost:8765
```

These local binaries are git-ignored, so you can rebuild without polluting the repo.

## Version manifest (for OTA)

The CI also generates `web-installer/version.json` containing :

```json
{
  "version":      "2.0.0",
  "git_sha":      "abc1234",
  "git_date":     "2026-05-05T22:30:00Z",
  "firmware_sha": "<sha256>",
  "littlefs_sha": "<sha256>",
  "firmware_url": "https://tigertag-project.github.io/TigerScale/firmware/firmware.bin",
  "littlefs_url": "https://tigertag-project.github.io/TigerScale/firmware/littlefs.bin"
}
```

Devices fetch this file to detect new versions and trigger OTA updates (see
`docs/FIRMWARE.md` § OTA).

## Browser support

| Browser | Web Serial API | Status |
|---|---|---|
| Chrome 89+ | ✅ | Works |
| Edge 89+ | ✅ | Works |
| Opera 75+ | ✅ | Works |
| Brave | ✅ | Works |
| Firefox | ❌ | Not supported (no Web Serial) |
| Safari | ❌ | Not supported (no Web Serial) |
| Mobile browsers | ❌ | Not supported |

The `index.html` shows a warning banner if Web Serial is unavailable.
