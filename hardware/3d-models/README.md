# 3D-printed parts

This directory contains the STL files needed to 3D-print a TigerScale enclosure.

## Files

| File | Part | Recommended material | Notes |
|---|---|---|---|
| `caixa.stl` | Main enclosure / case | PLA or PETG | The body of the scale |
| `base.stl` | Bottom plate | PLA | Holds the electronics tray |
| `prato.stl` | Weighing platform | PLA or PETG | Top plate where you place the spool |
| `roda_dentada.stl` | Servo gear | PETG or PLA+ | Mounted on the servo shaft |
| `ant_rfid.stl` | RFID antenna mount | PLA | Holds the RC522 module |
| `base_ant.stl` | RFID antenna base | PLA | Bracket for mounting the antenna |

## Recommended print settings

| Setting | Value | Why |
|---|---|---|
| Layer height | 0.2 mm | Good speed/quality balance |
| Infill | 30 % | Strong enough for a scale, fast enough to print |
| Walls / Perimeters | 3 | Rigidity of the case |
| Top / Bottom layers | 4 | Smooth top surface for the platform |
| Print speed | 60 mm/s | Default Cura/PrusaSlicer is fine |
| Supports | only for `roda_dentada.stl` (overhangs) | The rest is designed support-free |
| Material | PLA or PETG | PETG for higher temp resistance, PLA for ease |
| Brim | 5 mm | Helps adhesion on `prato.stl` (large flat) |

## Print orientation

All STL files are exported pre-oriented for printability. Just open in your slicer and slice — no rotation needed.

For the **gear** (`roda_dentada.stl`), make sure the teeth are vertical and the bore (servo shaft hole) is horizontal — most slicers detect this automatically.

## Print time estimate

| Part | Time (Ender 3 at 60 mm/s) | Filament |
|---|---|---|
| `caixa.stl` | ~6 h | 80 g |
| `base.stl` | ~2 h | 25 g |
| `prato.stl` | ~3 h | 40 g |
| `roda_dentada.stl` | ~30 min | 8 g |
| `ant_rfid.stl` | ~45 min | 12 g |
| `base_ant.stl` | ~30 min | 7 g |
| **Total** | **~13 h** | **~170 g** |

At ~20 €/kg PLA, that's about **3-4 € of filament total**.

## Customising the design

The STL files are exported from a parametric CAD model (Fusion 360 / FreeCAD — we'll publish the source files in a future release). If you need to modify dimensions :

- Use [TinkerCAD](https://www.tinkercad.com/) for simple modifications
- Use [Meshmixer](https://www.meshmixer.com/) or [Blender](https://www.blender.org/) for mesh editing
- Or fork and request the source CAD on [Discord](https://discord.gg/3Qv5TSqnJH)

## Variants and forks

Community-contributed alternative designs will be linked here :

- _(none yet — your contribution welcome!)_

To submit a variant, open a PR with your STL in a subdirectory : `hardware/3d-models/variants/your-name/`.

## Print problems?

- **Layer adhesion** : if PETG, dry it first (filament absorbs moisture)
- **Warping** on `caixa.stl` : add a brim, slow first layer to 20 mm/s, ensure bed is level
- **Stringing** on `roda_dentada.stl` : retraction 5 mm @ 45 mm/s, lower temp by 10 °C

See [TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md) for more, or ask on Discord.
