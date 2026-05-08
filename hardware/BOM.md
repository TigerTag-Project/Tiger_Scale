# Bill of Materials (BOM)

Total cost : **~30 € for the electronics** + cost of 3D-printed parts (typically < 5 € of filament).

> **Note** — most links below are short Amazon affiliate links (`amzn.to/...`) tagged with `tigertag09-21`. Buying through them helps fund development at no extra cost to you. You're free to source parts from any other supplier — these are just convenience links.

## Electronics

| Component | ~Price | Where to buy |
|---|---|---|
| **ESP32 Development Board** (KEYESTUDIO ESP32-WROOM-32, WiFi + Bluetooth) | 8 € | [amzn.to/4dhJV3u](https://amzn.to/4dhJV3u) |
| **OLED Display Module** (ELEGOO 0.96" 128×64 I²C self-luminous) | 4 € | [amzn.to/3Rul05f](https://amzn.to/3Rul05f) |
| **RFID Reader Module RC522** (13.56 MHz, SPI) — needs **2** | 6 € (×5 set) | [amzn.to/47mqpQt](https://amzn.to/47mqpQt) |
| **Dupont Jumper Wires** (ELEGOO 120 pcs 28 AWG 20 cm M-M, M-F, F-F) | 6 € | [amzn.to/42QEdB9](https://amzn.to/42QEdB9) |
| **Load Cell 5 kg + HX711 amplifier** (Wishiot kit) | 7 € | [amzn.to/3KZIOLl](https://amzn.to/3KZIOLl) |
| **Continuous Servo FS90R** (Wishiot 360° rotation) | 5 € | [amzn.to/4tRzpGZ](https://amzn.to/4tRzpGZ) |
| **Active Support Shaft Assembly** (Bambu Lab AMS — drives spool) | ~6 € | [Bambu Lab EU Store](https://eu.store.bambulab.com/fr/products/ams-active-support-shaft-assembly?id=47612006760796) |
| **Driven Support Shaft Assembly** (Bambu Lab AMS — spool follower) | ~6 € | [Bambu Lab EU Store](https://eu.store.bambulab.com/fr/products/ams-driven-support-shaft-assembly?id=47611983626588) |
| **Misc** : breadboard, 5 V/2 A USB power supply | ~5 € | Any electronics supplier |

**Total electronics + AMS shafts : ~47 €**

## 3D-printed parts

See [hardware/3d-models/](3d-models/) for STL files :

| File | Purpose | Recommended material |
|---|---|---|
| `case.stl` | Main enclosure | PLA or PETG |
| `bottom-plate.stl` | Bottom plate | PLA or PETG |
| `weighing-platform.stl` | Top platform where you place the spool | PLA or PETG |
| `servo-gear.stl` | Servo gear (drives the spool) | PLA or PETG |
| `rfid-antenna-mount.stl` | RFID antenna holder | PLA or PETG |
| `rfid-antenna-base.stl` | RFID antenna mounting bracket | PLA or PETG |

Recommended print settings :

- Layer height : 0.2 mm
- Infill : 30 %
- Walls : 3
- Top/bottom layers : 4
- Print orientation : as imported (designs are pre-oriented)

Total filament : ~170 g (≈ 3-4 € PLA at 20 €/kg).

## Bambu Lab AMS shaft mechanism

The two **AMS shaft assemblies** listed in the electronics table above provide the high-precision rotation mechanism that holds and spins the spool above the load cell. Buy them directly from the official Bambu Lab EU store.

(An alternative source, atome3d.com, also stocks them — useful if you're outside the EU shipping zone.)

## Total cost summary

| Configuration | Approx. cost |
|---|---|
| Electronics only (no AMS shafts) | 30-35 € |
| Electronics + AMS shafts (recommended) | ~47 € |
| Electronics + AMS shafts + 3D printing (own filament) | ~50 € |

## Where to source TigerTag NFC stickers

The RFID/NFC stickers themselves are not included — buy them separately :

- **TigerTag store** : <https://tigertag.io/shop>
- **Generic NTAG213 / MIFARE Classic 1K** stickers from AliExpress / Amazon work too, but they need to be programmed with TigerTag-compatible data structures (see [TigerTag-RFID-Guide](https://github.com/TigerTag-Project/TigerTag-RFID-Guide))

## Affiliate disclosure

As an Amazon Associate, the TigerTag Project earns from qualifying purchases. This costs you nothing extra and helps fund firmware development, 3D model iterations, and the cloud infrastructure that keeps the TigerTag service running.
