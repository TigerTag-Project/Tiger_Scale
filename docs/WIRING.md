# Wiring (ESP32 + 2x RC522 + HX711 + OLED + Servo)

## RC522 #1
- SDA/SS -> GPIO5
- RST -> GPIO27
- SCK -> GPIO18
- MOSI -> GPIO23
- MISO -> GPIO19
- 3.3V -> 3V3
- GND -> GND

## RC522 #2
- SDA/SS -> GPIO14
- RST -> GPIO25
- SCK -> GPIO18 (partilhado)
- MOSI -> GPIO23 (partilhado)
- MISO -> GPIO19 (partilhado)
- 3.3V -> 3V3
- GND -> GND

## HX711
- DOUT -> GPIO32
- SCK -> GPIO33
- VCC -> 3V3 (ou 5V, conforme modulo)
- GND -> GND

## OLED SSD1306 (I2C)
- SDA -> GPIO21
- SCL -> GPIO22
- VCC -> 3V3
- GND -> GND

## Servo 360
- Signal -> GPIO26
- V+ -> fonte 5V externa
- GND -> GND da fonte externa

Importante: ligar o GND da fonte externa ao GND do ESP32 (massa comum).
