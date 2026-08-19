# Auto Sync Script for SpriteHack Mod -> GDLauncher Instances (Single-File Mod)
$src = "C:\Users\pit2\Desktop\spritehack\fabric-mod\build\libs\spritehack-3.5.0.jar"
$target1 = "$env:APPDATA\gdlauncher_carbon\data\instances\fabric 1.20.4\instance\mods"
$target2 = "$env:APPDATA\gdlauncher_carbon\data\instances\fabric 26.2\instance\mods"
$target3 = "$env:APPDATA\.minecraft\mods"
$root = "C:\Users\pit2\Desktop\spritehack"

function Sync-SingleModFile {
    if (Test-Path $src) {
        if (Test-Path $target1) {
            Copy-Item $src "$target1\spritemod1.20.4.jar" -Force -ErrorAction SilentlyContinue
            Remove-Item "$target1\spritehack-3.5.0.jar" -Force -ErrorAction SilentlyContinue
            Remove-Item "$target1\spritehackmod.jar" -Force -ErrorAction SilentlyContinue
            Remove-Item "$target1\spritemod1.20.4.js" -Force -ErrorAction SilentlyContinue
        }
        if (Test-Path $target2) {
            Copy-Item $src "$target2\spritemod1.20.4.jar" -Force -ErrorAction SilentlyContinue
            Remove-Item "$target2\spritehack-3.5.0.jar" -Force -ErrorAction SilentlyContinue
            Remove-Item "$target2\spritehackmod.jar" -Force -ErrorAction SilentlyContinue
            Remove-Item "$target2\spritemod1.20.4.js" -Force -ErrorAction SilentlyContinue
        }
        if (Test-Path $target3) {
            Copy-Item $src "$target3\spritemod1.20.4.jar" -Force -ErrorAction SilentlyContinue
        }
        Copy-Item $src "$root\spritemod1.20.4.jar" -Force -ErrorAction SilentlyContinue
    }
}

# Initial sync
Sync-SingleModFile

# Continuous Loop
while ($true) {
    Start-Sleep -Seconds 5
    Sync-SingleModFile
}
