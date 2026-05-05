# Installation Guide

This guide walks you through flashing the TigerScale firmware and getting your scale online for the first time.

## Table of contents

- [Quick options overview](#quick-options-overview)
- [Option A — Web Installer (easiest)](#option-a--web-installer)
- [Option B — PlatformIO](#option-b--platformio)
- [Option C — Arduino IDE](#option-c--arduino-ide)
- [Libraries](#libraries)
- [First boot](#first-boot)
- [Updating the firmware](#updating-the-firmware)

---

## Quick options overview

| Method | Skill needed | Time | Best for |
|---|---|---|---|
| **A. Web Installer** | Just plug USB | 60 s | Non-technical users |
| **B. PlatformIO** | Some CLI familiarity | 5 min | Developers, contributors |
| **C. Arduino IDE** | Basic Arduino knowledge | 10 min | Maker community, classic flow |

You only need **one** of these. Pick whichever you're comfortable with.

---

## Option A — Web Installer

The TigerTag team hosts a browser-based flasher at **<https://tigertag-project.github.io/Tiger_Scale/>**.

### Requirements

- A **Chromium-based browser** : Chrome, Edge, Brave, Opera (Firefox/Safari are not supported because they lack Web Serial API)
- A **USB-C or micro-USB data cable** (a charge-only cable will NOT work)
- The ESP32 fully assembled with all components wired (or at least connected via USB)

### Steps

1. Plug your ESP32 into your computer via USB
2. Open <https://tigertag-project.github.io/Tiger_Scale/>
3. Click **"Install TigerScale"**
4. A browser dialog asks which serial port — select your ESP32 (commonly `cu.usbserial-XXXX` on macOS, `COM3+` on Windows, `ttyUSB0` on Linux)
5. Click **"Install"** and wait ~60 seconds (firmware + filesystem)
6. Done — the scale will reboot and enter Setup Mode

If the installer can't find your device, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md#usb-not-detected).

---

## Option B — PlatformIO

### Install PlatformIO

The simplest path is the [PlatformIO IDE extension for VS Code](https://platformio.org/install/ide?install=vscode):

1. Install [VS Code](https://code.visualstudio.com/)
2. Install the **PlatformIO IDE** extension from the marketplace
3. Restart VS Code

Or via CLI:

```bash
pip install --user platformio
```

### Clone and build

```bash
git clone https://github.com/TigerTag-Project/Tiger_Scale.git
cd Tiger_Scale

# Compile firmware (no upload yet)
pio run

# First flash — uploads firmware AND filesystem
pio run -t upload
pio run -t uploadfs

# Open the serial monitor
pio device monitor
```

If `pio` complains about USB upload speed or "Failed to verify flash chip connection", reduce `upload_speed` in `platformio.ini` (try `460800` then `230400`).

---

## Option C — Arduino IDE

### Install Arduino IDE 2.x

Download from <https://www.arduino.cc/en/software>.

### Add ESP32 board support

1. **File → Preferences** → "Additional Boards Manager URLs":

   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```

2. **Tools → Board → Boards Manager** → search "esp32" → install **"esp32 by Espressif Systems"**

### Configure the board

- **Board** : `ESP32 Dev Module`
- **Upload Speed** : `460800` (or `921600` if your USB is reliable)
- **Partition Scheme** : `Default 4MB with spiffs`
- **Flash Mode** : `DIO`
- **Flash Frequency** : `80 MHz`

### Open the sketch

Arduino IDE expects a sketch in a folder of the same name. To make it Arduino-compatible:

```bash
git clone https://github.com/TigerTag-Project/Tiger_Scale.git
cd Tiger_Scale
mkdir -p arduino/TigerScale
cp src/main.cpp arduino/TigerScale/TigerScale.ino
```

Then **File → Open** → `arduino/TigerScale/TigerScale.ino`.

### Install libraries

See [Libraries](#libraries) below.

### Upload firmware

Press the **upload arrow** in Arduino IDE.

### Upload the LittleFS filesystem (web UI)

Arduino IDE 2.x doesn't yet have a built-in LittleFS uploader. Use one of:

- **Plugin** : [arduino-littlefs-upload](https://github.com/earlephilhower/arduino-littlefs-upload) (drag-and-drop installer)
- **CLI** : the `mklittlefs` tool that ships with `arduino-cli`

Or simply switch to PlatformIO for this step (it handles filesystem upload natively with `pio run -t uploadfs`).

---

## Libraries

If you use **PlatformIO**, libraries are auto-resolved from `platformio.ini`. Skip this section.

If you use **Arduino IDE**, install these via **Tools → Manage Libraries** :

| Library | Author | Tested version |
|---|---|---|
| `WiFiManager` | tzapu | 2.0.16-rc.2 |
| `ESPAsyncWebServer` | me-no-dev | 1.2.3 |
| `AsyncTCP` | me-no-dev | 1.1.1 |
| `Adafruit SSD1306` | Adafruit | 2.5.7 |
| `Adafruit GFX Library` | Adafruit | 1.11.3 |
| `HX711` | bogde | 0.7.5 |
| `MFRC522` | miguelbalboa | 1.4.10 |
| `ArduinoJson` | Benoit Blanchon | **6.21.5** (NOT v7) |
| `ESP32Servo` | madhephaestus | 3.0.5 |

---

## First boot

When the ESP32 boots for the first time (or after a factory reset), it has no Wi-Fi credentials and starts an **Access Point**.

### 1. Connect to the setup network

The OLED displays:

```
CONFIG MODE
Connect to WiFi
Setup-TigerScale-XXXX
```

On your phone or computer, join the Wi-Fi network **`Setup-TigerScale-XXXX`** (no password).

### 2. Configure your home Wi-Fi

Most operating systems open the captive portal automatically. If not, browse to **<http://192.168.4.1>**.

You'll see a list of nearby Wi-Fi networks. Select yours and enter the password.

### 3. Reboot

The scale automatically reconnects to your home Wi-Fi. The OLED now shows:

```
READY! Open browser:
192.168.X.Y
tigerscale-XXXX.local
WiFi: YourNetwork
```

### 4. Open the web interface

On any device on the same network, open **<http://tigerscale-XXXX.local>** (replace `XXXX` with your scale's MAC suffix).

If `.local` resolution doesn't work (some routers / corporate networks block mDNS), use the IP directly.

### 5. Sign in

A login modal appears. Choose:

- **🔵 Continue with Google** — opens a popup, you grant access, done
- **📧 Email + password** — for users with a TigerTag email account

Once logged in, the modal closes and you see the main UI : weight, RFID UID, calibration wizard, account info.

### 6. Calibrate

If this is a new device, run the **Calibration wizard** (Section "✨ Calibration" in the UI):

1. Empty the platform → click **Step 2 →**
2. Place a known-weight masterspool (BambuLab, R3D, or custom) → confirm
3. The scale stores the calibration factor

### 7. Pair your TigerTag spools

Place a TigerTagged spool on the platform. The RFID readers detect the tags within 1-2 seconds. The OLED displays the spool metadata (manufacturer, material, color) and the net weight.

---

## Updating the firmware

### Via Web Installer

Re-open <https://tigertag-project.github.io/Tiger_Scale/> and click **Install** again. Your settings (Wi-Fi, Firebase, calibration) are preserved across firmware updates.

### Via PlatformIO

```bash
git pull
pio run -t upload
pio run -t uploadfs   # only if data/ changed
```

### OTA (over-the-air)

Not yet supported. Planned for v2.1.

---

## Need help?

- 🐛 [Open an issue](https://github.com/TigerTag-Project/Tiger_Scale/issues)
- 💬 [Join the Discord](https://discord.gg/3Qv5TSqnJH)
- 📚 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
