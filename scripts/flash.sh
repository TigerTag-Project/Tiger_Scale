#!/usr/bin/env bash
#
# Build and flash both the firmware and the LittleFS filesystem to a TigerScale.
#
# Usage:
#   ./scripts/flash.sh                        # auto-detects USB serial port
#   ./scripts/flash.sh /dev/cu.usbserial-110  # specify port

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v pio >/dev/null 2>&1; then
    if [ -x "$HOME/.platformio/penv/bin/pio" ]; then
        PIO="$HOME/.platformio/penv/bin/pio"
    else
        echo "❌ PlatformIO (pio) not found." >&2
        exit 1
    fi
else
    PIO=pio
fi

PORT="${1:-}"
if [ -z "$PORT" ]; then
    # Auto-detect on macOS / Linux
    PORT=$(ls /dev/cu.usbserial-* /dev/ttyUSB* 2>/dev/null | head -n1 || true)
    if [ -z "$PORT" ]; then
        echo "❌ No USB serial port detected. Plug your ESP32 in and re-run."  >&2
        echo "   Or specify the port: ./scripts/flash.sh /dev/cu.usbserial-XXXX" >&2
        exit 1
    fi
    echo "ℹ Auto-detected port : $PORT"
fi

echo "→ Flashing firmware …"
"$PIO" run -t upload --upload-port "$PORT"

echo "→ Flashing filesystem …"
"$PIO" run -t uploadfs --upload-port "$PORT"

echo "✓ All done. Open the serial monitor :"
echo "    $PIO device monitor --port $PORT --baud 115200"
