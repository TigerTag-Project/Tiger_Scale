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

## Updating the binaries

Whenever you release a new firmware version :

1. Build with PlatformIO :
   ```bash
   pio run         # → .pio/build/esp32dev/firmware.bin
                   # → .pio/build/esp32dev/bootloader.bin
                   # → .pio/build/esp32dev/partitions.bin
   pio run -t buildfs   # → .pio/build/esp32dev/littlefs.bin
   ```

2. Copy the binaries here :
   ```bash
   mkdir -p web-installer/firmware
   cp .pio/build/esp32dev/{firmware,bootloader,partitions,littlefs}.bin web-installer/firmware/
   ```

3. Get `boot_app0.bin` (one-time, doesn't change) :
   ```bash
   # macOS / Linux PlatformIO install
   cp ~/.platformio/packages/framework-arduinoespressif32/tools/partitions/boot_app0.bin \
      web-installer/firmware/
   ```

4. Update `manifest.json` if the version changed

5. Commit and push — GitHub Pages auto-deploys

## Hosting on GitHub Pages

Enable GitHub Pages on this repo :

- **Settings → Pages**
- **Source** : Deploy from branch
- **Branch** : `main` / **folder** : `/web-installer`
- Save

After ~1 minute, the page is live at `https://<owner>.github.io/<repo>/`.

## Why not auto-build with CI?

We could automate the binary copy via GitHub Actions (after the build step in `.github/workflows/build.yml`). For v2.0.0 we keep it manual — automation is on the roadmap.

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
