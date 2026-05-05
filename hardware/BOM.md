# Bill of Materials (BOM)

Total cost : **~30 € for the electronics** + cost of 3D-printed parts (typically < 5 € of filament).

> **Note** : Some Amazon links below contain TigerTag affiliate tags (`tag=tigertag09-21`). Buying through them helps fund development at no extra cost to you. You're free to source parts from any other supplier — these are just convenience links.

## Electronics

| Component | ~Price | Where to buy |
|---|---|---|
| **ESP32 DevKit** (30-pin, ESP-WROOM-32) | 8 € | [Keyestudio (Amazon FR)](https://www.amazon.fr/KEYESTUDIO-d%C3%A9veloppement-Bluetooth-Compatible-Arduino/dp/B0BHZ8H6LM/) — also widely available on AliExpress |
| **OLED 0.96" SSD1306 128×64 I²C** | 4 € | [Elegoo (Amazon FR)](https://www.amazon.fr/dp/B0D7PWN66S?tag=tigertag09-21) |
| **2× RC522 RFID readers** (13.56 MHz) | 6 € (set of 2) | [Amazon FR](https://www.amazon.fr/dp/B0DB577L6W?tag=tigertag09-21) |
| **HX711 + 5 kg load cell kit** | 7 € | [Wishiot (Amazon FR)](https://www.amazon.fr/Wishiot-num%C3%A9riques-pr%C3%A9cision-%C3%A9lectronique-ensembles/dp/B0CRCY863F?tag=tigertag09-21) |
| **Continuous servo (FS90R)** | 5 € | [Wishiot (Amazon FR)](https://www.amazon.fr/Wishiot-rotation-continue-Microbit-h%C3%A9licopt%C3%A8re/dp/B0BZH7JK4N) |
| **Misc** : jumper wires, breadboard, 5 V/2 A USB power supply | ~5 € | Any electronics supplier |

**Total electronics : ~35 €**

## 3D-printed parts

See [hardware/3d-models/](3d-models/) for STL files :

| File | Purpose | Recommended material | Notes |
|---|---|---|---|
| `caixa.stl` | Main enclosure (case) | PLA / PETG | The body of the scale |
| `base.stl` | Bottom plate | PLA | Holds the electronics tray |
| `prato.stl` | Weighing platform | PLA / PETG | Top plate where you place the spool |
| `roda_dentada.stl` | Servo gear | PETG / PLA+ | Mounted on the servo, drives the spool |
| `ant_rfid.stl` | RFID antenna mount | PLA | Holds the RC522 module |
| `base_ant.stl` | RFID antenna base | PLA | Mounting bracket |

Recommended print settings (PLA) :

- Layer height : 0.2 mm
- Infill : 30 %
- Walls : 3
- Top/bottom layers : 4
- Print orientation : as imported (designs are pre-oriented for printability)

## Optional Bambu Lab AMS parts

If you want a high-precision rotation mechanism (e.g. for AMS-style spool holders), the Bambu Lab official replacement parts can be repurposed :

- [Driven Support Shaft Assembly](https://www.atome3d.com/collections/bambu-lab-pieces-detachees-3d-france/products/bambu-lab-ams-support-darbre-dentrainement-driven-support-shaft-assembly)
- [Active Support Shaft Assembly](https://www.atome3d.com/collections/bambu-lab-pieces-detachees-3d-france/products/bambu-lab-ams-support-actif-darbre-active-support-shaft-assembly)

These are optional — the basic 3D-printed gear works fine for most use cases.

## Total cost summary

| Configuration | Approx. cost |
|---|---|
| Electronics only | 30-35 € |
| Electronics + 3D printing (own filament) | ~35-40 € |
| Electronics + AMS parts upgrade | 50-60 € |

## Where to source TigerTag NFC stickers

The RFID/NFC stickers themselves are not included — buy them separately :

- **TigerTag store** : <https://tigertag.io/shop> (TODO: launch link)
- **Generic NTAG213/MIFARE Classic 1K** stickers from AliExpress / Amazon work too, but they need to be programmed with TigerTag-compatible data structures (see [TigerTag-RFID-Guide](https://github.com/TigerTag-Project/TigerTag-RFID-Guide))
