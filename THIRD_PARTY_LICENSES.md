# Third-Party Licenses

TigerScale firmware and web UI are released under the **MIT License**.
They depend on the following third-party libraries, each retaining its own license.

---

## Firmware dependencies (PlatformIO / Arduino)

### ESPAsyncWebServer
- **Author**: Hristo Gochkov (me-no-dev)
- **License**: GNU Lesser General Public License v3.0 (LGPL-3.0)
- **Source**: https://github.com/me-no-dev/ESPAsyncWebServer
- **Note**: Statically linked into the firmware binary. Because TigerScale is fully
  open-source (all source code and build scripts provided), users can modify and
  recompile this component, satisfying the LGPL "ability to re-link" requirement.

### AsyncTCP
- **Author**: Hristo Gochkov (me-no-dev)
- **License**: GNU Lesser General Public License v3.0 (LGPL-3.0)
- **Source**: https://github.com/me-no-dev/AsyncTCP
- **Note**: Same LGPL compliance note as ESPAsyncWebServer above.

### ESP32Servo
- **Author**: Kevin Harrington (madhephaestus)
- **License**: GNU Lesser General Public License v2.1 (LGPL-2.1)
- **Source**: https://github.com/madhephaestus/ESP32Servo
- **Note**: Same LGPL compliance note as ESPAsyncWebServer above.

### WiFiManager
- **Author**: tzapu
- **License**: MIT License
- **Source**: https://github.com/tzapu/WiFiManager

### ArduinoJson
- **Author**: Benoit Blanchon
- **License**: MIT License
- **Source**: https://github.com/bblanchon/ArduinoJson

### HX711
- **Author**: Bogdan Necula
- **License**: MIT License
- **Source**: https://github.com/bogde/HX711

### MFRC522
- **Author**: Miguel Balboa
- **License**: The Unlicense (public domain)
- **Source**: https://github.com/miguelbalboa/rfid

### Adafruit SSD1306
- **Author**: Adafruit Industries
- **License**: BSD License
- **Source**: https://github.com/adafruit/Adafruit_SSD1306

### Adafruit GFX Library
- **Author**: Adafruit Industries
- **License**: BSD License
- **Source**: https://github.com/adafruit/Adafruit-GFX-Library

### arduino-esp32 (framework)
- **Author**: Espressif Systems
- **License**: Apache License 2.0
- **Source**: https://github.com/espressif/arduino-esp32

---

## Web UI dependencies (LittleFS / browser)

The web UI (`data/www/`) is vanilla HTML/CSS/JavaScript with no bundled third-party libraries.
All Firebase interactions are performed by the ESP32 firmware via REST API — no Firebase SDK
is bundled or served from the device.

---

## Web Installer

The web installer (`web-installer/`) uses:

### ESP Web Tools
- **Author**: ESPHome project
- **License**: MIT License
- **Source**: https://github.com/esphome/esp-web-tools

---

## LGPL Compliance Statement

The LGPL-licensed components (ESPAsyncWebServer, AsyncTCP, ESP32Servo) are linked
statically into the firmware binary. TigerScale satisfies the LGPL requirements by:

1. **Providing full source code** of the complete firmware under an open-source license (MIT).
2. **Providing the build system** (PlatformIO + `platformio.ini`) that allows any user to
   modify the LGPL components and produce a new firmware binary.
3. **Providing installation instructions** ([docs/INSTALLATION.md](docs/INSTALLATION.md))
   so any user can rebuild and reflash the firmware.

This satisfies LGPL-3.0 §4 and LGPL-2.1 §6 ("work that uses the Library").
