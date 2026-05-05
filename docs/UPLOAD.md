# Upload (PowerShell)

## 1) Firmware (.ino) com Arduino CLI da IDE

```powershell
cd "C:\Users\Zalman\Documents\Codex\2026-04-23-neste-site-estrair-o-codigo-para\TigerTag-Scale-V2\firmware"
& "$env:LOCALAPPDATA\Programs\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe" compile --fqbn esp32:esp32:esp32 "TigerTag_Scale_V2.ino"
& "$env:LOCALAPPDATA\Programs\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe" upload -p COM11 --fqbn esp32:esp32:esp32 "TigerTag_Scale_V2.ino"
```

## 2) LittleFS (web/data -> littlefs.bin)

```powershell
cd "C:\Users\Zalman\Documents\Codex\2026-04-23-neste-site-estrair-o-codigo-para\TigerTag-Scale-V2\web"
& "C:\Users\Zalman\AppData\Local\Arduino15\packages\esp32\tools\mklittlefs\4.0.2-db0513a\mklittlefs.exe" -c ".\data" -s 0xE0000 ".\littlefs.bin"
& "C:\Users\Zalman\AppData\Local\Arduino15\packages\esp32\tools\esptool_py\5.2.0\esptool.exe" --chip esp32 --port COM11 --baud 921600 write_flash 0x310000 ".\littlefs.bin"
```

Depois faz refresh forcado na pagina (`Ctrl+F5`).
