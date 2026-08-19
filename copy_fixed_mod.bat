@echo off
set SRC=C:\Users\pit2\Desktop\spritehack\fabric-mod\build\libs\spritehack-3.5.0.jar

REM Copy mod files to root & .minecraft/mods & fabric 1.20.4 instance
copy /Y "%SRC%" "C:\Users\pit2\Desktop\spritehack\spritemod1.20.4.jar"
copy /Y "%SRC%" "%APPDATA%\.minecraft\mods\spritemod1.20.4.jar"

set INST1=%APPDATA%\gdlauncher_carbon\data\instances\fabric 1.20.4\instance\mods
if exist "%INST1%" (
    copy /Y "%SRC%" "%INST1%\spritemod1.20.4.jar"
    if exist "%INST1%\spritehack-3.5.0.jar" del /f /q "%INST1%\spritehack-3.5.0.jar"
    if exist "%INST1%\spritehackmod.jar" del /f /q "%INST1%\spritehackmod.jar"
    if exist "%INST1%\spritemod1.20.4.js" del /f /q "%INST1%\spritemod1.20.4.js"
)

REM Remove incompatible 1.20.4 compiled bytecode from 26.2 instance to prevent ClassNotFoundException crash
set INST2=%APPDATA%\gdlauncher_carbon\data\instances\fabric 26.2\instance\mods
if exist "%INST2%" (
    if exist "%INST2%\spritemod26.2.jar" del /f /q "%INST2%\spritemod26.2.jar"
    if exist "%INST2%\spritemod1.20.4.jar" del /f /q "%INST2%\spritemod1.20.4.jar"
    if exist "%INST2%\spritehack-3.5.0.jar" del /f /q "%INST2%\spritehack-3.5.0.jar"
    if exist "%INST2%\spritehackmod.jar" del /f /q "%INST2%\spritehackmod.jar"
)

echo [OK] GDLauncher updated: 1.20.4 instance active! 26.2 crash conflict resolved.
