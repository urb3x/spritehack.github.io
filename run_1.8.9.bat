@echo off
title SpriteHack 1.8.9 Vanilla Launcher
color 0B
echo ========================================================
echo   SPRITEHACK 1.8.9 (KLASYCZNY PVP & MINECRAFT 1.8.9)
echo ========================================================
echo   Nick       : %USERNAME%
echo   Prawy Shift: Menu ClickGUI / Navigator
echo ========================================================
echo.

set MC_DIR=%APPDATA%\.minecraft
set VER_DIR=%MC_DIR%\versions\1.8.9

java -Xmx4G -Xms1G "-Djava.library.path=%MC_DIR%\natives" -cp "%VER_DIR%\1.8.9.jar;%MC_DIR%\libraries\*" net.minecraft.client.main.Main --username "SpriteHacker" --version "1.8.9" --gameDir "%MC_DIR%" --assetsDir "%MC_DIR%\assets" --assetIndex "1.8.9" --uuid "00000000-0000-0000-0000-000000000000" --accessToken "0" --userType "legacy"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] Kod zakonczenia: %ERRORLEVEL%
    pause
)
