// Desktop Minecraft Launcher Generator (Cracked / Offline)
export class DesktopLauncher {
  static generateBatchScript(username, version, ramGb = 6) {
    const cleanUser = username || 'SpriteHacker';
    return `@echo off
title SpriteHack Cracked Launcher - %USERNAME%
color 0D
echo ========================================================
echo   SPRITEHACK CRACKED MINECRAFT LAUNCHER v3.5
echo ========================================================
echo   Username   : ${cleanUser}
echo   Version    : ${version}
echo   Alloc RAM  : ${ramGb} GB
echo   Auth Type  : Cracked / Offline (accessToken=0)
echo ========================================================
echo.
echo [*] Checking Java Runtime Environment...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Java was not found in your PATH!
    echo [!] Please install Java 17 or 21 from: https://adoptium.net/
    pause
    exit /b 1
)

echo [*] Starting Minecraft ${version} with SpriteHack Client...
set APPDATA_MC=%APPDATA%\\.minecraft
set GAME_JAR=%APPDATA_MC%\\versions\\${version}\\${version}.jar

java -Xmx${ramGb}G -Xms2G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M -Djava.library.path=%APPDATA_MC%\\natives -cp "%APPDATA_MC%\\libraries\\*;%GAME_JAR%" net.minecraft.client.main.Main --username "${cleanUser}" --version "${version}" --gameDir "%APPDATA_MC%" --assetsDir "%APPDATA_MC%\\assets" --assetIndex "${version}" --uuid "00000000-0000-0000-0000-000000000000" --accessToken "0" --userType "legacy"

if %errorlevel% neq 0 (
    echo [!] Process exited with code %errorlevel%
    pause
)
`;
  }

  static downloadLauncherBat(username, version, ramGb) {
    const batContent = this.generateBatchScript(username, version, ramGb);
    const blob = new Blob([batContent], { type: 'application/bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `launch_spritehack_${version}.bat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
