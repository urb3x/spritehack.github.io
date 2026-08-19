@echo off
title SpriteHack Fabric Mod Builder
color 0A
echo ========================================================
echo   SPRITEHACK FABRIC MOD BUILDER v3.5
echo   Kompiluje prawdziwy Fabric mod dla Minecraft 1.20.4
echo ========================================================
echo.

set JAVA_HOME=C:\Program Files\Pylo\MCreator\jdk
set PATH=%JAVA_HOME%\bin;%PATH%
set MOD_DIR=%~dp0

echo [1/3] Sprawdzanie Javy...
java -version
if %ERRORLEVEL% neq 0 (
    echo [BLAD] Java nie znaleziona!
    pause
    exit /b 1
)

echo.
echo [2/3] Budowanie moda (pierwsze uruchomienie pobierze Gradle + mappings ~200MB)...
echo.
cd /d "%MOD_DIR%"

REM Download Gradle 8.5 if not present
set GRADLE_DIST=%USERPROFILE%\.gradle\wrapper\dists
if not exist "%GRADLE_DIST%\gradle-8.5-bin" (
    echo [*] Pobieranie Gradle 8.5...
    curl -L "https://services.gradle.org/distributions/gradle-8.5-bin.zip" -o "%TEMP%\gradle-8.5-bin.zip"
    mkdir "%GRADLE_DIST%\gradle-8.5-bin\*" 2>nul
    tar -xf "%TEMP%\gradle-8.5-bin.zip" -C "%TEMP%"
    echo [OK] Gradle 8.5 przygotowany
)

REM Run gradle build using the local wrapper
java -classpath "%~dp0gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain build -x test 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [BLAD] Kompilacja nie powiodla sie.
    echo Sprobuj uruchomic: gradlew.bat build
    pause
    exit /b 1
)

echo.
echo [3/3] Kopiowanie moda do .minecraft/mods...
set MC_MODS=%APPDATA%\.minecraft\mods
if not exist "%MC_MODS%" mkdir "%MC_MODS%"
copy /Y "%~dp0build\libs\spritehack-*.jar" "%MC_MODS%\"
echo.
echo ========================================================
echo   SUKCES! Mod skopiowany do: %MC_MODS%
echo   Uruchom Minecraft z profilem: fabric-loader-0.15.7-1.20.4
echo   Nacisnij PRAWY SHIFT w grze aby otworzyc ClickGUI!
echo ========================================================
pause
