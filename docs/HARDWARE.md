# Hardware Guide

Pinout, wiring, electrical specs, and assembly instructions for TigerScale.

## Table of contents

- [Component list](#component-list)
- [Pinout](#pinout)
- [Wiring tables](#wiring-tables)
- [ASCII wiring diagram](#ascii-wiring-diagram)
- [Power budget](#power-budget)
- [Assembly](#assembly)

---

## Component list

### Required

| Component | Spec | Notes |
|---|---|---|
| ESP32 DevKit | 30-pin layout, 4 MB flash | ESP32-WROOM-32 chip |
| RC522 RFID readers | 13.56 MHz NFC, SPI | **2 needed** (twin-tag support) |
| HX711 | 24-bit ADC, load cell amplifier | Green PCB modules work fine |
| Load cell | 5 kg or 20 kg | 4-wire half-bridge |
| OLED display | SSD1306 128×64, I²C, 0.96" or 1.3" | I²C address `0x3C` |
| Continuous servo | FS90R or compatible (360° rotation) | NOT a regular servo |
| External 5 V supply | ≥ 2 A | For servo (USB alone is not enough) |
| Jumper wires | M-M and M-F, ~30 each | |
| Breadboard | 830 hole standard | For prototyping |
| USB cable | **Data**, USB-A or USB-C to micro-USB | Charge-only cables fail to upload |

### 3D-printed parts

See [hardware/3d-models/](../hardware/3d-models/) for STL files:

- `caixa.stl` — main enclosure (case)
- `base.stl` — bottom plate / electronics tray
- `prato.stl` — weighing platform
- `roda_dentada.stl` — gear (mounted on servo)
- `ant_rfid.stl` + `base_ant.stl` — RFID antenna mount

### Optional

| Component | Purpose |
|---|---|
| 100 µF + 10 µF capacitors | Power filtering near ESP32 |
| 4.7 kΩ resistors ×2 | I²C pull-ups (often built into the OLED module) |
| Heat-set inserts | For threaded mounting in 3D-printed case |
| Acrylic or glass plate | Top of weighing platform (replaces 3D plate) |

---

## Pinout

### ESP32 GPIO map

```
         ┌──────────────────────────┐
         │       ESP32 DevKit       │
   GND ──┤ GND                  VIN ├── 5 V (servo / HX711 power)
  3.3V ──┤ 3V3                  GND ├── GND
         │ D35                  D23 ├── MOSI (RC522 ×2 shared)
         │ D34                  D22 ├── SCL  (OLED I²C)
         │ TX0                  TX2 │
         │ RX0                  RX2 │
         │ D32 ── HX711 DOUT    D21 ├── SDA  (OLED I²C)
         │ D33 ── HX711 SCK     D19 ├── MISO (RC522 ×2 shared)
         │ D25 ── RC522 #2 RST  D18 ├── SCK  (RC522 ×2 shared)
         │ D26 ── Servo signal  D5  ├── RC522 #1 SS
         │ D27 ── RC522 #1 RST  D17 │
         │ D14 ── RC522 #2 SS   D16 │
         │ D12                  D4  │
   GND ──┤ GND                  D2  ├── Onboard LED (heartbeat)
         │ D13                  D15 │
         └──────────────────────────┘
```

---

## Wiring tables

### RC522 RFID Reader #1

| RC522 pin | Function | ESP32 pin |
|---|---|---|
| VCC | 3.3 V | 3V3 |
| GND | Ground | GND |
| SCK | SPI clock | GPIO 18 |
| MOSI | SPI master out | GPIO 23 |
| MISO | SPI master in | GPIO 19 |
| SDA / SS | Chip select | GPIO 5 |
| RST | Reset | GPIO 27 |
| IRQ | (unused) | — |

### RC522 RFID Reader #2

| RC522 pin | Function | ESP32 pin |
|---|---|---|
| VCC | 3.3 V | 3V3 |
| GND | Ground | GND |
| SCK | SPI clock | GPIO 18 ← **shared** |
| MOSI | SPI master out | GPIO 23 ← **shared** |
| MISO | SPI master in | GPIO 19 ← **shared** |
| SDA / SS | Chip select | **GPIO 14** (different from #1) |
| RST | Reset | **GPIO 25** (different from #1) |
| IRQ | (unused) | — |

> **Important** : the SPI bus (SCK/MOSI/MISO) is shared. Only the SS and RST pins differ. This is intentional — it's how multiple RC522 readers coexist on a single SPI bus.

### HX711 Load Cell Amplifier

| HX711 pin | Function | ESP32 pin |
|---|---|---|
| VCC | Power | 3V3 (or 5 V if your module supports it) |
| GND | Ground | GND |
| DT (DOUT) | Data out | GPIO 32 |
| SCK | Clock | GPIO 33 |
| E+ | Excitation + | Load cell red wire |
| E− | Excitation − | Load cell black wire |
| A+ | Channel A + | Load cell green or white wire |
| A− | Channel A − | Load cell white or green wire |

> Load cell wire colour depends on manufacturer — verify with a multimeter or the datasheet of your specific cell.

### OLED Display SSD1306 (I²C)

| OLED pin | Function | ESP32 pin |
|---|---|---|
| VCC | 3.3 V | 3V3 |
| GND | Ground | GND |
| SDA | I²C data | GPIO 21 |
| SCL | I²C clock | GPIO 22 |

The OLED's I²C address is `0x3C` by default. If yours uses `0x3D`, edit `OLED_ADDR` in `src/main.cpp`.

### Continuous Servo (FS90R)

| Servo wire | Function | Connection |
|---|---|---|
| Brown / Black | Ground | External 5 V supply GND **AND** ESP32 GND (common ground!) |
| Red | Power 5 V | External 5 V supply (NOT the ESP32 5 V pin) |
| Orange / Yellow | PWM signal | GPIO 26 |

> Powering the servo from the ESP32's 5 V pin causes brownouts and erratic behaviour. Use an external 5 V / 2 A supply, and tie its GND to the ESP32 GND.

---

## ASCII wiring diagram

```
                              ESP32 DevKit
                       ┌────────────────────────┐
                       │                        │
                3.3V ──┤ 3V3              GND   ├── GND ────────┐
                       │                        │               │
                       │ GPIO 18 ─── SCK ───┐   │               │
                       │ GPIO 23 ── MOSI ──┐│   │               │
                       │ GPIO 19 ── MISO ─┐│└── shared SPI bus  │
                       │                  ││                    │
                       │                  ▼▼▼                   │
                       │             ┌─────────┐ ┌─────────┐    │
                       │ GPIO 5 ─SS──│ RC522#1 │ │ RC522#2 │──SS── GPIO 14
                       │ GPIO 27 RST─│         │ │         │─RST── GPIO 25
                       │             │ 3V3 GND │ │ 3V3 GND │
                       │             └────┬────┘ └────┬────┘
                       │                  │           │
                       │                 3V3         3V3
                       │                  │           │
                       │ GPIO 21 ─ SDA ───┐                       OLED
                       │ GPIO 22 ─ SCL ──┐│                ┌──────────────┐
                       │                 ▼▼                │ SDA SCL VCC GND│
                       │                                  └──┬───┬───┬───┬─┘
                       │                                     │   │   │   │
                       │                                     21  22 3V3 GND
                       │
                       │ GPIO 32 ── DT ─┐         HX711                 Load cell
                       │ GPIO 33 ── SCK─┤   ┌──────────────┐         ┌────────┐
                       │                └──→│ DT SCK 5V GND│   E+ ──→│ Red    │
                       │                    │ E+  E-  A+ A-├──→ E- ─→│ Black  │
                       │                    └──────────────┘   A+ ──→│ Green  │
                       │                                       A- ──→│ White  │
                       │                                              └────────┘
                       │
                       │ GPIO 26 ── Signal ─→  Servo FS90R
                       │                    ┌─────────┐
                       │                    │ ─ PWM   │
                       │                    │ ─ 5V ←─── External 5V supply (+)
                       │                    │ ─ GND ←── External 5V supply (-)
                       │                    └─────────┘                  │
                       │                                                  │
                       │ GND ─────── (common ground with external supply)─┘
                       │
                       │ VIN ←── 5 V (USB or external)
                       └────────────────────────┘
```

---

## Power budget

| Component | Voltage | Typical current | Peak current |
|---|---|---|---|
| ESP32 (idle, Wi-Fi off) | 3.3 V | 50 mA | 80 mA |
| ESP32 (Wi-Fi TX) | 3.3 V | 160 mA | 240 mA |
| RC522 ×2 | 3.3 V | 50 mA each | 200 mA total during read |
| HX711 + load cell | 3.3-5 V | 5 mA | 15 mA |
| OLED | 3.3 V | 15 mA | 25 mA |
| Servo FS90R (idle) | 5 V | 100 mA | — |
| Servo FS90R (running) | 5 V | 500 mA | 900 mA (stall) |
| **Estimated total (typ.)** | | **~750 mA** | **~1.5 A** |

**Recommended supply** : 5 V / 2 A USB-C power adapter, or a 5 V / 3 A bench supply.

The USB port of a laptop usually maxes at 500 mA on USB-A and 900 mA on USB-C — borderline for the servo. **Use an external 5 V supply for the servo.**

---

## Assembly

### Step 1 — Test on breadboard first

Before printing the case, wire everything on a breadboard and validate:

1. ESP32 powers up, OLED shows boot screen
2. Both RC522 readers detect a test tag (check serial logs `[RFID] UID...`)
3. Load cell weighs roughly correctly after calibration
4. Servo rotates when commanded (`startServoSearch()` triggered)

If anything misbehaves at this stage, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

### Step 2 — 3D-print the case

See [hardware/3d-models/README.md](../hardware/3d-models/README.md) for recommended print settings (PLA, 30 % infill, 0.2 mm layer height).

### Step 3 — Mount the load cell

The load cell is the most mechanically critical part:

1. Bolt one end of the load cell to the **base** (rigid)
2. Bolt the other end to the **platform** (the part that flexes)
3. **Do not** over-tighten — you can permanently deform the cell
4. The platform must be **suspended** with no contact with the base or case

### Step 4 — Mount RFID readers

The 2 readers should be:

- Below the platform, facing upward
- Spaced ~10 cm apart (one reads the side tag of the spool, the other the front tag as the spool rotates)
- At least 2 cm away from each other to avoid interference

### Step 5 — Mount servo

The servo's gear meshes with the spool to rotate it. Use the included `roda_dentada.stl` printed in PETG or PLA+ for durability.

### Step 6 — Wire harness

Use M-F dupont jumpers from the ESP32 to each module. Keep the SPI bus wires (SCK/MOSI/MISO) short — long SPI lines pick up noise.

### Step 7 — Calibrate

After assembly, run the Calibration wizard in the web UI. Use a known masterspool weight as reference.

---

## Need help with hardware?

- 📐 [3D model README](../hardware/3d-models/README.md) — print settings + slicer profiles
- 🛒 [Bill of Materials](../hardware/BOM.md) — vendor links, prices
- 🐛 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — common build issues
- 💬 [Discord](https://discord.gg/3Qv5TSqnJH) — community help
