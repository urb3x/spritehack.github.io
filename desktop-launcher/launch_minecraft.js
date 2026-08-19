// Standalone Official Mojang Minecraft Launcher & Downloader for SpriteHack (Cracked)
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION = process.argv.includes('--version') ? process.argv[process.argv.indexOf('--version') + 1] : '1.20.4';
const USERNAME = process.argv.includes('--username') ? process.argv[process.argv.indexOf('--username') + 1] : 'SpriteHacker';
const RAM_GB = process.argv.includes('--ram') ? process.argv[process.argv.indexOf('--ram') + 1] : '4';

console.log('\x1b[35m========================================================\x1b[0m');
console.log('\x1b[36m   ⚡ SPRITEHACK OFFICIAL MOJANG MINECRAFT LAUNCHER     \x1b[0m');
console.log('\x1b[35m========================================================\x1b[0m');
console.log(` \x1b[33m• Version  :\x1b[0m ${VERSION}`);
console.log(` \x1b[33m• Username :\x1b[0m ${USERNAME}`);
console.log(` \x1b[33m• RAM      :\x1b[0m ${RAM_GB} GB`);
console.log(` \x1b[33m• Auth     :\x1b[0m Cracked / Offline (accessToken=0)`);
console.log('\x1b[35m========================================================\x1b[0m\n');

// 1. Detect Java executable
function findJava() {
  const possiblePaths = [
    'C:\\Program Files\\Pylo\\MCreator\\jdk\\bin\\java.exe',
    'C:\\Program Files\\JetBrains\\PyCharm 2024.1.4\\jbr\\bin\\java.exe',
    'C:\\Program Files\\JetBrains\\PyCharm Community Edition 2024.1.4\\jbr\\bin\\java.exe',
    'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.10.7-hotspot\\bin\\java.exe',
    'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe',
    'C:\\Program Files\\Java\\jdk-21\\bin\\java.exe',
    'java'
  ];

  for (const p of possiblePaths) {
    if (p === 'java' || fs.existsSync(p)) {
      return p;
    }
  }
  return 'java';
}

const javaExe = findJava();
console.log(`\x1b[32m[✓] Found Java Runtime:\x1b[0m ${javaExe}`);

// 2. Setup directories
const appData = process.env.APPDATA || path.join(process.env.USERPROFILE || 'C:\\', 'AppData', 'Roaming');
const mcDir = path.join(appData, '.minecraft');
const versionsDir = path.join(mcDir, 'versions', VERSION);
const clientJarPath = path.join(versionsDir, `${VERSION}.jar`);
const nativesDir = path.join(mcDir, 'natives');
const librariesDir = path.join(mcDir, 'libraries');

fs.mkdirSync(versionsDir, { recursive: true });
fs.mkdirSync(nativesDir, { recursive: true });
fs.mkdirSync(librariesDir, { recursive: true });

// 3. Helper to download file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      return resolve(dest);
    }
    console.log(`\x1b[36m[*] Downloading:\x1b[0m ${path.basename(dest)}...`);
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`\x1b[32m[✓] Downloaded:\x1b[0m ${path.basename(dest)}`);
          resolve(dest);
        });
      });
    });
    req.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// 4. Download Client Jar
async function prepareAndLaunch() {
  try {
    let clientJarUrl = 'https://piston-data.mojang.com/v1/objects/8448167fb7a4231603da8f8a7142544446c6bd01/client.jar';
    if (VERSION === '1.8.9') {
      clientJarUrl = 'https://launcher.mojang.com/v1/objects/16478950d4b9c1d6ff739bf877f3a8b417dfebaa/client.jar';
    }

    await downloadFile(clientJarUrl, clientJarPath);

    console.log(`\x1b[32m[✓] Genuine Mojang ${VERSION}.jar ready!\x1b[0m`);
    console.log(`\x1b[35m[*] Launching Minecraft ${VERSION} with SpriteHack Client...\x1b[0m`);

    const jvmArgs = [
      `-Xmx${RAM_GB}G`,
      '-Xms1G',
      '-XX:+UnlockExperimentalVMOptions',
      '-XX:+UseG1GC',
      `-Djava.library.path=${nativesDir}`,
      '-cp',
      `${clientJarPath};${path.join(librariesDir, '*')}`,
      'net.minecraft.client.main.Main',
      '--username', USERNAME,
      '--version', VERSION,
      '--gameDir', mcDir,
      '--assetsDir', path.join(mcDir, 'assets'),
      '--assetIndex', VERSION,
      '--uuid', '00000000-0000-0000-0000-000000000000',
      '--accessToken', '0',
      '--userType', 'legacy'
    ];

    const child = spawn(javaExe, jvmArgs, {
      cwd: mcDir,
      stdio: 'inherit'
    });

    child.on('error', (err) => {
      console.error('\x1b[31m[!] Launch error:\x1b[0m', err.message);
    });

    child.on('close', (code) => {
      console.log(`\n\x1b[33m[*] Minecraft process exited with code ${code}\x1b[0m`);
    });

  } catch (err) {
    console.error('\x1b[31m[!] Error preparing launch:\x1b[0m', err.message);
  }
}

prepareAndLaunch();
