#!/usr/bin/env bash
#
# Build the LittleFS image for the TigerScale web UI.
# Output : .pio/build/esp32dev/littlefs.bin
#
# Usage:
#   ./scripts/build_littlefs.sh
#
# Then flash it with:
#   pio run -t uploadfs
#
# Or manually:
#   esptool.py --chip esp32 --port /dev/cu.usbserial-XXXX --baud 460800 \
#     write_flash 0x310000 .pio/build/esp32dev/littlefs.bin

set -euo pipefail

# Move to repo root
cd "$(dirname "$0")/.."

if ! command -v pio >/dev/null 2>&1; then
    if [ -x "$HOME/.platformio/penv/bin/pio" ]; then
        PIO="$HOME/.platformio/penv/bin/pio"
    else
        echo "❌ PlatformIO (pio) not found in PATH or ~/.platformio/penv/bin/" >&2
        echo "   Install: pip install platformio" >&2
        exit 1
    fi
else
    PIO=pio
fi

echo "→ Building LittleFS image from data/ …"
"$PIO" run -t buildfs

OUT=".pio/build/esp32dev/littlefs.bin"
if [ -f "$OUT" ]; then
    echo "✓ Built : $OUT ($(wc -c < "$OUT") bytes)"
else
    echo "❌ Build succeeded but $OUT not found." >&2
    exit 1
fi
