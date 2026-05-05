# TigerTag Scale V2

Versao organizada para publicacao no GitHub, baseada na versao funcional atual.

## Estrutura

- `firmware/TigerTag_Scale_V2.ino` firmware principal (Arduino IDE)
- `web/data/www/` frontend LittleFS (index, script, css, imagens)
- `docs/WIRING.md` ligacoes de hardware
- `docs/UPLOAD.md` passos de upload firmware + LittleFS

## Requisitos

- Arduino IDE 2.x
- Board: `ESP32 Dev Module`
- Bibliotecas:
  - `ESP Async WebServer`
  - `AsyncTCP`
  - `WiFiManager`
  - `ArduinoJson`
  - `Adafruit SSD1306`
  - `Adafruit GFX`
  - `HX711`
  - `MFRC522`
  - `ESP32Servo`

## Uso rapido

1. Abrir `firmware/TigerTag_Scale_V2.ino` no Arduino IDE.
2. Compilar e gravar no ESP32.
3. Gerar e gravar LittleFS com o conteudo de `web/data`.
4. Abrir a interface web da balanca pelo IP.

## Nota

Esta pasta V2 nao apaga as versoes antigas. Serve como base limpa para continuar o desenvolvimento.
