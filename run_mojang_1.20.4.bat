@echo off
title SpriteHack - Mojang Minecraft 1.20.4 [%USERNAME%]
color 0B
echo ========================================================
echo   SPRITEHACK - GENUINE MOJANG MINECRAFT 1.20.4
echo ========================================================
echo   Version    : 1.20.4 (Modern Fabric Anarchy)
echo   Player     : SpriteGod
echo   Alloc RAM  : 16 GB
echo   Cheats     : Wallhack, Aimbot, KillAura, Fly, Scaffold
echo   Keybind    : Right Shift (ClickGUI)
echo ========================================================
echo.

java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Java runtime was not found in PATH.
    echo [!] Please install OpenJDK 17 or 21 from https://adoptium.net/
    pause
    exit /b 1
)

echo [*] Launching genuine Mojang Minecraft 1.20.4 with SpriteHack...
java -Xmx16G -Xms2G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -Djava.library.path="C:\Users\pit2\AppData\Roaming\.minecraft\natives" -cp "C:\Users\pit2\AppData\Roaming\.minecraft\libraries\*;C:\Users\pit2\AppData\Roaming\.minecraft\versions\1.20.4\1.20.4.jar" net.minecraft.client.main.Main --username "SpriteGod" --version "1.20.4" --gameDir "C:\Users\pit2\AppData\Roaming\.minecraft" --assetsDir "C:\Users\pit2\AppData\Roaming\.minecraft\assets" --assetIndex "1.20.4" --uuid "00000000-0000-0000-0000-000000000000" --accessToken "0" --userType "legacy"

pause
