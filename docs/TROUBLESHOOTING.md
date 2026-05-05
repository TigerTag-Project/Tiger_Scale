# Troubleshooting

Common issues and how to fix them. Search this page (Cmd+F / Ctrl+F) before opening an issue.

## Table of contents

- [USB / Flashing](#usb--flashing)
- [Wi-Fi setup](#wi-fi-setup)
- [Firebase login](#firebase-login)
- [Web UI](#web-ui)
- [RFID](#rfid)
- [Weight / load cell](#weight--load-cell)
- [Servo](#servo)
- [Display (OLED)](#display-oled)

---

## USB / Flashing

### "USB not detected" / no port appears

- ✅ Check the cable — many micro-USB cables are **charge-only** and have no data lines. Try a different cable.
- ✅ Check the USB port. Hubs (especially passive USB hubs) sometimes don't pass data reliably. Plug directly into the computer.
- ✅ Driver missing? Run `system_profiler SPUSBDataType` (macOS), `lsusb` (Linux), or Device Manager (Windows). Look for "CP210x", "CH340", "CH9102", or "FTDI". If absent, install the driver from the chip vendor.
- ✅ On macOS Sequoia (15+), recent CH340 chips are signed by Apple — no driver needed. Older chips may need [WCH driver](https://www.wch.cn/downloads/CH341SER_MAC_ZIP.html).
- ✅ Press the **EN** button on the ESP32 — sometimes the device gets stuck in deep-sleep.

### "Failed to connect" or "Failed to verify flash chip"

- ✅ Lower `upload_speed` in `platformio.ini` (try `460800`, then `230400`, then `115200`)
- ✅ Hold the **BOOT** button while plugging in (forces the ESP32 into download mode)
- ✅ The maker-style USB-C breakout boards sometimes have flaky DTR/RTS — try unplug + replug + immediate flash

### "Brownout detector triggered"

- The ESP32 is losing power during flash. Causes:
  - USB hub can't supply enough current → plug directly
  - Servo is connected to ESP32 5V pin → connect servo to **external 5V** and tie GNDs
  - 3.3 V regulator is overloaded → temporarily disconnect peripherals during flash

---

## Wi-Fi setup

### Captive portal doesn't open automatically

iOS and Android usually open it automatically when you join the `Setup-TigerScale-XXXX` AP. If yours doesn't:

- Manually browse to **<http://192.168.4.1>**
- Disable mobile data so the phone uses the AP for DNS resolution
- On Android, sometimes "Use Wi-Fi without internet" needs to be enabled

### Scale shows "WiFi ERROR / Restarting"

The Wi-Fi connection failed within 60 s of the captive portal. Causes:

- Wrong password — double-check (passwords are case-sensitive)
- 5 GHz network — ESP32 only supports **2.4 GHz**
- Captive Wi-Fi portal at home (e.g. some pro networks) — won't work, you need a normal home network
- Special characters in SSID (`'` `"` `\`) can confuse WiFiManager — rename your SSID

### `tigerscale-XXXX.local` doesn't resolve

mDNS (`.local` resolution) requires Bonjour / Avahi. It may fail when:

- Your router blocks multicast (some Free / Bouygues / corporate routers do)
- You're on iOS and `mDNSResponder` is buggy
- Workaround : use the **IP address directly** (visible on the OLED at boot)

To re-display the IP, reset the scale (power cycle).

---

## Firebase login

### Modal shows but Google button does nothing

- Open browser DevTools (F12) → Console tab → look for errors
- Most common : `auth/unauthorized-domain` — see next section

### "auth/unauthorized-domain"

The Firebase project doesn't authorise the domain hosting the OAuth bridge.

**Fix (TigerTag cloud users)** : This shouldn't happen — open an issue.

**Fix (self-hosted users)** : In Firebase Console → Authentication → Settings → Authorized domains, add your hosting domain (e.g. `mytiger.web.app`).

### "Network error. Check your connection"

The web UI received the tokens from the OAuth bridge but failed to POST them to `/api/firebase/token` on the device.

- Check that the device is reachable: `curl http://YOUR_SCALE_IP/api/status`
- Look at the Serial monitor (`pio device monitor`) for `[FIREBASE TOKEN]` log lines
- Common cause : firmware was flashed but `data/` filesystem wasn't — flash both with `pio run -t upload && pio run -t uploadfs`

### "INVALID_LOGIN_CREDENTIALS"

For email/password login : password is wrong, OR account doesn't exist on the TigerTag Firebase project.

- Try **Google sign-in** instead (no password required)
- Or create/sign in to your TigerTag account from <https://tigertag.io>

### Stays signed in after logout

Hard-refresh your browser : `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux).
The service worker may serve a stale page.

---

## Web UI

### Page won't load (`tigerscale-XXXX.local` works but blank page)

- Hard-refresh : `Cmd+Shift+R` / `Ctrl+Shift+R`
- Try the IP directly
- Filesystem not flashed : `pio run -t uploadfs`
- Open DevTools → Network tab → see which file is failing to load

### Logo, images broken

- Same as above — `data/` not flashed properly
- Or `mklittlefs` produced a corrupted image (rare) — rebuild with `pio run -t buildfs`

### Logout button doesn't work

- Check Serial logs for `[FIREBASE]` errors when DELETE /api/firebase/auth is called
- Sometimes AsyncWebServer mishandles DELETE — falls through to 404. Power-cycle the scale and re-test.

---

## RFID

### Tags not detected

- Distance : tags should be **< 10 mm** from the antenna for reliable reading
- Position : RC522 reads through the platform (a few mm of plastic is fine), not through metal
- Tag type : ensure they're **MIFARE Classic 1K** or compatible (TigerTags are this type by default)
- Check Serial : `[RFID] UID: ...` should appear when a tag is brought close

### Only one reader works

- Verify wiring : SPI bus is shared (SCK/MOSI/MISO same pins), but SS/RST must differ between readers
- Test each reader individually — comment out the other reader's `PCD_Init()` and see if the failing one starts
- One reader's RST pin may be floating — verify continuity with multimeter

### Wrong UID format (decimal instead of hex)

The firmware reads UIDs as decimal but sends hex to Firestore. If you see decimal in your Firestore docs, that's a legacy format — see `uidMigrationMap` in `firestore.rules`.

---

## Weight / load cell

### Weight reads 0 or huge negative

- HX711 not connected properly — check DT and SCK wiring
- Load cell wires backwards (E+ ↔ E-, A+ ↔ A-) — values will be negative-of-correct, swap two wires
- Power supply too weak — HX711 needs stable 3.3 V or 5 V

### Weight is unstable / jumps around

- Mechanical : the load cell mounting must be **rigid base + flexible platform**. If both ends are bolted to the same rigid frame, the cell can't flex and reads garbage.
- Electrical noise : keep HX711 wires short, away from the WiFi antenna
- Calibration : run the **Calibration wizard** in the UI, don't trust default values

### Calibration factor seems wrong

The default `calibrationFactor = 406.0f` is for a specific 5 kg load cell. Yours may differ. The wizard computes the correct factor for your unit — always run it after assembly.

---

## Servo

### Servo doesn't move

- It's a **continuous servo** (FS90R or compatible), not a regular positional servo
- Make sure it's powered from the **external 5 V supply**, not the ESP32
- The signal pin (orange/yellow) must go to **GPIO 26**
- The external supply's GND must be connected to the ESP32 GND (common ground)

### Servo runs constantly

The state machine starts the servo when weight > 150 g and no UID detected, to rotate the spool until the second tag is found. If a tag is never detected, the servo runs forever — check your tags work first.

### Servo whines but doesn't rotate

- Stuck mechanically : the gear is binding, or the spool is too heavy for FS90R (max ~1.5 kg-cm torque)
- Stall current trips the brownout — switch to a stronger supply or a higher-torque servo

---

## Display (OLED)

### OLED not lighting up

- I²C address : default is `0x3C`. If yours is `0x3D`, edit `OLED_ADDR` in `src/main.cpp`
- Power : ensure 3.3 V, not 5 V (some clones tolerate 5 V, most don't)
- Wiring : SDA → GPIO 21, SCL → GPIO 22
- Pull-up resistors : usually built into the OLED breakout. If yours doesn't have them, add 4.7 kΩ to 3.3 V on each line

### Display flickers / shows garbage

- I²C bus contention with another device — disconnect everything else
- Wires too long or unshielded — keep < 30 cm

### Text appears upside down / mirrored

Edit `display.setRotation(...)` in the firmware (defaults to 0 — try 2 for 180°).

---

## Still stuck?

- Check the Serial monitor logs (`pio device monitor`) for `[ERROR]`, `[FIREBASE]`, `[BOOT]` lines
- Search [GitHub issues](https://github.com/TigerTag-Project/Tiger_Scale/issues) for similar reports
- Ask on [Discord](https://discord.gg/3Qv5TSqnJH) — fastest community help
- [Open a new issue](https://github.com/TigerTag-Project/Tiger_Scale/issues/new) using the bug report template
