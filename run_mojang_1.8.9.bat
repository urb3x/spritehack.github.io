@echo off
title SpriteHack - Mojang Minecraft 1.8.9 [%USERNAME%]
color 0B
echo ========================================================
echo   SPRITEHACK - GENUINE MOJANG MINECRAFT 1.8.9
echo ========================================================
echo   Version    : 1.8.9 (Classic Combat PvP)
echo   Player     : SpriteHacker
echo   Alloc RAM  : 16 GB
echo   Auth Mode  : Cracked / Offline (accessToken=0)
echo ========================================================
echo.

java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Java runtime was not found in PATH.
    echo [!] Please install OpenJDK 17 or 21 from https://adoptium.net/
    pause
    exit /b 1
)

echo [*] Launching genuine Mojang Minecraft 1.8.9 with SpriteHack...
java -Xmx16G -Xms2G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -Djava.library.path="C:\Users\pit2\AppData\Roaming\.minecraft\natives" -cp "C:\Users\pit2\AppData\Roaming\.minecraft\libraries\*;C:\Users\pit2\AppData\Roaming\.minecraft\versions\1.8.9\1.8.9.jar" net.minecraft.client.main.Main --username "SpriteHacker" --version "1.8.9" --gameDir "C:\Users\pit2\AppData\Roaming\.minecraft" --assetsDir "C:\Users\pit2\AppData\Roaming\.minecraft\assets" --assetIndex "1.8.9" --uuid "00000000-0000-0000-0000-000000000000" --accessToken "0" --userType "legacy"

pause
