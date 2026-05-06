# Bill of Materials (BOM)

Total cost : **~30 € for the electronics** + cost of 3D-printed parts (typically < 5 € of filament).

> **Note** — most links below are short Amazon affiliate links (`amzn.to/...`) tagged with `tigertag09-21`. Buying through them helps fund development at no extra cost to you. You're free to source parts from any other supplier — these are just convenience links.

## Electronics

| Component | ~Price | Where to buy |
|---|---|---|
| **ESP32 Development Board** (Binghe ESP32-WROOM-32, CH340, USB-C) | 8 € | [amzn.to/4hlnITL](https://amzn.to/4hlnITL) |
| **OLED Display Module** (ELEGOO 0.96" 128×64 I²C self-luminous) | 4 € | [amzn.to/47gIf7j](https://amzn.to/47gIf7j) |
| **RFID Reader Module RC522** (13.56 MHz, SPI) — needs **2** | 6 € (×5 set) | [amzn.to/47mqpQt](https://amzn.to/47mqpQt) |
| **Dupont Jumper Wires** (ELEGOO 120 pcs 28 AWG 20 cm M-M, M-F, F-F) | 6 € | [amzn.to/42QEdB9](https://amzn.to/42QEdB9) |
| **Load Cell 5 kg + HX711 amplifier** (Wishiot kit) | 7 € | [amzn.to/3KZIOLl](https://amzn.to/3KZIOLl) |
| **Continuous Servo FS90R** (Wishiot 360° rotation) | 5 € | [amzn.to/4tRzpGZ](https://amzn.to/4tRzpGZ) |
| **Misc** : breadboard, 5 V/2 A USB power supply | ~5 € | Any electronics supplier |

**Total electronics : ~35 €**

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

## Optional Bambu Lab AMS parts

For a higher-precision rotation mechanism, the Bambu Lab official AMS replacement parts can be repurposed :

- [Driven Support Shaft Assembly](https://www.atome3d.com/collections/bambu-lab-pieces-detachees-3d-france/products/bambu-lab-ams-support-darbre-dentrainement-driven-support-shaft-assembly)
- [Active Support Shaft Assembly](https://www.atome3d.com/collections/bambu-lab-pieces-detachees-3d-france/products/bambu-lab-ams-support-actif-darbre-active-support-shaft-assembly)

Optional — the basic 3D-printed gear works fine for most use cases.

## Total cost summary

| Configuration | Approx. cost |
|---|---|
| Electronics only | 30-35 € |
| Electronics + 3D printing (own filament) | ~35-40 € |
| Electronics + AMS parts upgrade | 50-60 € |

## Where to source TigerTag NFC stickers

The RFID/NFC stickers themselves are not included — buy them separately :

- **TigerTag store** : <https://tigertag.io/shop>
- **Generic NTAG213 / MIFARE Classic 1K** stickers from AliExpress / Amazon work too, but they need to be programmed with TigerTag-compatible data structures (see [TigerTag-RFID-Guide](https://github.com/TigerTag-Project/TigerTag-RFID-Guide))

## Affiliate disclosure

As an Amazon Associate, the TigerTag Project earns from qualifying purchases. This costs you nothing extra and helps fund firmware development, 3D model iterations, and the cloud infrastructure that keeps the TigerTag service running.
