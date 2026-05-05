# Firmware Architecture

Reference for the C++ firmware in `src/main.cpp`.

## Table of contents

- [High-level overview](#high-level-overview)
- [Boot sequence](#boot-sequence)
- [Main loop](#main-loop)
- [Subsystems](#subsystems)
- [REST API](#rest-api)
- [Persistent storage (NVS)](#persistent-storage-nvs)
- [State machines](#state-machines)
- [Memory budget](#memory-budget)

---

## High-level overview

The firmware is a **single-file Arduino sketch** (`src/main.cpp`, ~3000 lines) that runs on an ESP32. It's organised in clearly-marked sections, each separated by a comment banner :

```cpp
// ============================================================================
// HARDWARE CONFIGURATION
// ============================================================================
// ============================================================================
// FIREBASE AUTHENTICATION
// ============================================================================
// ... etc
```

The sections are :

1. Hardware configuration (pins, addresses, thresholds)
2. Forward declarations
3. Global state (variables, filters, caches)
4. OLED display
5. WiFi / WiFiManager / mDNS
6. LittleFS bootstrapping
7. Firebase authentication (sign-in, refresh, token endpoint)
8. Firestore REST API (heartbeat, weight write, twin-tag pairing)
9. WebSocket
10. Weight filter (median + EMA + hysteresis + dead-zone)
11. Auto-tare logic
12. HTTP REST endpoints
13. RFID readers (dual RC522)
14. Continuous servo state machine
15. Setup() and loop()

## Boot sequence

```
setup()
├── Serial.begin(115200)
├── Wire.begin(21, 22)            ← I²C bus for OLED
├── display.begin()                ← OLED init
├── displayMessage("Starting...", "v2.0.0")
├── prefs.begin("config")
│   ├── Load fbEmail, fbPass (legacy)
│   ├── Load fbRefresh, fbUid     ← NEW: token-based auth
│   └── Load calFactor
├── setupWiFi()                    ← WiFiManager auto-connect (or AP fallback)
├── ensureFirebaseToken()          ← Refresh token via securetoken.googleapis.com
├── initScaleFirestoreSync()       ← Sets gScaleDocPath = users/{uid}/scales/{mac}
├── setupFileSystem()              ← LittleFS mount
├── setupWebServer()               ← AsyncWebServer + /ws WebSocket
├── setupScale()                   ← HX711 init, restore tare offset
├── setupRFID()                    ← Both RC522 PCD_Init()
└── setupServo()                   ← FS90R, force STOP position
```

## Main loop

The `loop()` function is non-blocking and runs every ~10 ms :

```cpp
void loop() {
    blinkLED();                     // 1 Hz heartbeat indicator
    detectWiFiNetworkChange();      // wipe Firebase if SSID changed
    sendScaleHeartbeat();           // every 30 s
    if (!rfidLockedForCurrentLoad && !autoTarePending) {
        pollRFIDReaders();          // both RC522
        fetchMetaIfNewUid();        // brand/material/colour
    }
    float weight = readWeight();
    handleAutoTare(weight);
    updateServoWorkflow(weight);
    detectSpoolRemoval();
    every(WS_UPDATE_INTERVAL_MS) {
        broadcastWeightOverWebSocket();
        updateOLED();
    }
    if (!autoTarePending) handleAutoPush(weight);
    delay(10);
}
```

## Subsystems

### Weight filter

The HX711 raw output is **noisy** : ±2 g spikes are common. We chain three filters :

1. **Median filter** (window 15) : removes outliers
2. **EMA** (α = 0.05 fine, 0.12 fast) : smooths drift
3. **Hysteresis + dead-zone** : final display value only changes if the delta exceeds 0.5 g

```cpp
float raw = scale.get_units(1);
gMedianBuf[gMedianIdx] = raw;
float median = computeMedian();
gEmaWeight += alpha * (median - gEmaWeight);
float displayed = applyHysteresis(applyDeadZone(gEmaWeight));
```

The `STABLE_DISPLAY_MS` (1500 ms) of low-delta is required before a new value is "committed" to the display.

### Auto-tare

When weight stays in the **0.5–8 g range** for **1.2 s** after spool removal, the scale auto-tares. This corrects for any drift introduced during the previous weighing cycle.

The auto-tare is **gated** :

- It activates only if `servoLockedUntilAutotare` is true (i.e. just sent a weight)
- It clears `firstUidDetectedMs`, RFID locks, and stops the servo

### Twin-tag pairing (§6.1 spec)

When **two different tags** are detected on the same spool within `RFID_SECOND_TAG_TIMEOUT_MS` (15 s), the firmware applies a decision matrix :

| `tagA.twin_tag_uid` | `tagB.twin_tag_uid` | Action |
|---|---|---|
| `null`, `null` | New pair → set `A.twin = B`, `B.twin = A` | |
| `B`, `A` | ✅ Already correctly paired → just update both | |
| `B`, `null` | ⚠️ Asymmetric → fix `B.twin = A`, update both | |
| `null`, `A` | ⚠️ Asymmetric → fix `A.twin = B`, update both | |
| `C` (≠B), `*` | 🚨 Conflict — A is paired with another spool C → **skip write** | |
| `*`, `D` (≠A) | 🚨 Conflict — B is paired with another spool D → **skip write** | |
| `C`, `D` (both ≠ each other & ≠self) | Two different multi-spool stacks → **skip write** | |

This logic is in `updateScaleLastSpool()` around line 1380-1530.

### Servo state machine

```
   OFF (no weight)
    │ weight ≥ 150 g
    ▼
   SEARCHING ←──── (no UID detected)
    │ UID detected
    ▼
   STOPPED ←──── (during weighing + after Firestore write)
    │ auto-tare done + spool removed
    ▼
   OFF
```

`stopServoSearch()` calls `spoolServo.detach()` because `writeMicroseconds(SERVO_STOP_US)` alone doesn't reliably stop continuous servos (ESP32Servo lib quirk).

---

## REST API

All endpoints return JSON unless noted. CORS is **not** enabled — the UI must be served from the same origin (the ESP32 itself).

### Status

```
GET /api/status
```

Returns the live state :

```json
{
  "weight": 250,
  "rawWeight": 250.34,
  "uid": "0123456789ABCDEF",
  "uid_hex": "0123456789ABCDEF",
  "uid2": "",
  "uid2_hex": "",
  "wifi": "MyHomeWiFi",
  "ip": "192.168.1.42",
  "mdns": "tigerscale-1F94.local",
  "cloud": "ok",
  "firebaseConfigured": true,
  "firebaseAuth": true,
  "firebaseEmail": "user@example.com",
  "calibrationFactor": 406.0,
  "uptime_s": 1234,
  "sendToCloud": ""
}
```

### Firebase authentication

```
POST /api/firebase/auth        # email + password sign-in
GET  /api/firebase/auth        # auth status
DELETE /api/firebase/auth      # sign out (wipes all tokens)
POST /api/firebase/token       # ⭐ NEW : direct token storage (used by OAuth bridge)
```

The `token` endpoint accepts a body of :

```json
{
  "idToken": "eyJ...",
  "refreshToken": "AMf...",
  "uid": "abc123",
  "email": "user@example.com",
  "displayName": "Jane",
  "provider": "google.com"
}
```

It stores the refresh token in NVS and never asks for a password.

### Tare and calibration

```
POST /api/tare                 # force a manual tare
POST /api/calibration          # body: { factor: 406.0 }
```

### Misc

```
POST /api/weight               # push a weight value (with optional uid override)
POST /api/push-weight          # legacy push (no uid override)
POST /api/reset-wifi           # forget Wi-Fi credentials, reboot
POST /api/factory-reset        # wipe everything, reboot
GET  /api/ping                 # → "pong"
```

### WebSocket

```
WS /ws
```

The ESP32 broadcasts a JSON snapshot every 250 ms :

```json
{ "weight": 250, "uid": "...", "uid2": "" }
```

It also broadcasts `firebaseStatus` events when the auth state changes.

---

## Persistent storage (NVS)

The ESP32's non-volatile storage (NVS) is used for settings that survive reboots :

| Key | Type | Purpose |
|---|---|---|
| `fbEmail` | string | Firebase user email (also for Google) |
| `fbPass` | string | Legacy password — **not set** for token-based auth |
| `fbRefresh` | string | ⭐ Firebase refresh token (Google + email/password) |
| `fbUid` | string | Firebase UID |
| `apiKey` | string | (Legacy) TigerTag API key for Cloud Function bridge |
| `calFactor` | float | HX711 scale calibration factor |
| `tareFactor` | float | HX711 tare offset |

NVS is partitioned at offset `0x9000` (size 20 KB). Data persists across firmware updates as long as the partition layout doesn't change.

A factory reset (`POST /api/factory-reset`) clears the entire `config` namespace.

---

## Memory budget

| Resource | Used | Total | % |
|---|---|---|---|
| Flash | ~1.3 MB | 1.5 MB (app0) | 82 % |
| RAM (static) | ~50 KB | 320 KB | 16 % |
| RAM (heap, runtime) | ~80-120 KB | ~270 KB | varies |
| LittleFS | ~900 KB | 896 KB | 100 % |

There's headroom for ~270 KB more firmware code (e.g. for OTA support in v2.1).

---

## Adding a new feature

Recommended workflow :

1. Open an issue describing the feature
2. Fork → branch `feature/xxx`
3. Add code in the appropriate section (don't dump everything in `loop()`)
4. Update CHANGELOG.md
5. Test with `pio run` and on hardware
6. Open PR — see [CONTRIBUTING.md](../CONTRIBUTING.md)

Common pitfalls :

- **Don't use `delay()` > 50 ms in `loop()`** — it kills the WebSocket / RFID polling responsiveness
- **Don't use `String + String` in tight loops** — fragmentation kills the ESP32 long-term
- **Use `[TAG]` prefixes** in `Serial.printf` for log filtering : `[BOOT]`, `[FIREBASE]`, `[WEIGHT]`, etc.
