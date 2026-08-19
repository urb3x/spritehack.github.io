@echo on
title SpriteHack - Minecraft 1.8.9 [%USERNAME%]
color 0B
echo ========================================================
echo   SPRITEHACK - OFICJALNY MINECRAFT 1.8.9 (MOJANG)
echo ========================================================
echo   Wersja     : 1.8.9 (Klasyczny PvP)
echo   Gracz      : SpriteHacker
echo   RAM        : 6 GB
echo   Katalog    : C:\Users\pit2\AppData\Roaming\.minecraft
echo   Menu Hack  : Prawy Shift (Right Shift)
echo ========================================================
echo.

"C:\Program Files\Pylo\MCreator\jdk\bin\java.exe" -Xmx6G -Xms1G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -Djava.library.path="C:\Users\pit2\AppData\Roaming\.minecraft\natives" -cp "C:\Users\pit2\AppData\Roaming\.minecraft\versions\1.8.9\1.8.9.jar;C:\Users\pit2\AppData\Roaming\.minecraft\libraries\*" net.minecraft.client.main.Main --username "SpriteHacker" --version "1.8.9" --gameDir "C:\Users\pit2\AppData\Roaming\.minecraft" --assetsDir "C:\Users\pit2\AppData\Roaming\.minecraft\assets" --assetIndex "1.8.9" --uuid "00000000-0000-0000-0000-000000000000" --accessToken "0" --userType "legacy"

if %errorlevel% neq 0 (
    echo.
    echo [!] Kod zakonczenia: %errorlevel%
    pause
)
