@echo off
set "JDK=C:\Program Files\Pylo\MCreator\jdk\bin"
set "FORGE_JAR=C:\Users\pit2\AppData\Roaming\gdlauncher_carbon\data\libraries\net\minecraftforge\forge\1.8.9-11.15.1.2318-1.8.9\forge-1.8.9-11.15.1.2318-1.8.9.jar"

echo === Compiling SpriteHack 1.8.9 Forge Mod ===
"%JDK%\javac.exe" -source 1.8 -target 1.8 -cp "%FORGE_JAR%" -d forge-1.8.9-mod forge-1.8.9-mod\net\spritehack\forge189\SpriteHackForgeMod.java

echo === Packaging spritemod1.8.9.jar ===
"%JDK%\jar.exe" -cf spritemod1.8.9.jar -C forge-1.8.9-mod .

copy /Y spritemod1.8.9.jar "%APPDATA%\.minecraft\mods\spritemod1.8.9.jar"
copy /Y spritemod1.8.9.jar "%APPDATA%\gdlauncher_carbon\data\instances\forge 1.8.9\instance\mods\spritemod1.8.9.jar"

echo [SUCCESS] Built 1.8.9 Forge Mod!
