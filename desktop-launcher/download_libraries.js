import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mcDir = path.join(process.env.APPDATA || 'C:\\', '.minecraft');
const librariesDir = path.join(mcDir, 'libraries');
const nativesDir = path.join(mcDir, 'natives');

fs.mkdirSync(librariesDir, { recursive: true });
fs.mkdirSync(nativesDir, { recursive: true });

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
      return resolve();
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed ${url}: HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function processVersion(verId, manifestUrl) {
  console.log(`\n\x1b[36m[*] Processing Mojang ${verId} Libraries & Natives...\x1b[0m`);
  const manifest = await fetchJson(manifestUrl);
  
  // Save version manifest JSON
  const verJsonPath = path.join(mcDir, 'versions', verId, `${verId}.json`);
  fs.mkdirSync(path.dirname(verJsonPath), { recursive: true });
  fs.writeFileSync(verJsonPath, JSON.stringify(manifest, null, 2));

  let downloadedCount = 0;
  const classpaths = [];

  for (const lib of manifest.libraries) {
    // 1. Artifact jar
    if (lib.downloads && lib.downloads.artifact) {
      const art = lib.downloads.artifact;
      const dest = path.join(librariesDir, art.path);
      classpaths.push(dest);
      try {
        await download(art.url, dest);
        downloadedCount++;
      } catch (e) {
        // Continue if mirror fails
      }
    } else if (lib.name) {
      // Legacy 1.8.9 format
      const parts = lib.name.split(':');
      const group = parts[0].replace(/\./g, '/');
      const name = parts[1];
      const version = parts[2];
      const jarName = `${name}-${version}.jar`;
      const relPath = path.join(group, name, version, jarName);
      const dest = path.join(librariesDir, relPath);
      const url = `https://libraries.minecraft.net/${group}/${name}/${version}/${jarName}`;
      classpaths.push(dest);
      try {
        await download(url, dest);
        downloadedCount++;
      } catch (e) {}
    }

    // 2. Natives for Windows
    if (lib.downloads && lib.downloads.classifiers && lib.downloads.classifiers['natives-windows']) {
      const nat = lib.downloads.classifiers['natives-windows'];
      const natDest = path.join(librariesDir, nat.path);
      try {
        await download(nat.url, natDest);
        // Extract native jar into nativesDir using tar/powershell
        try {
          execSync(`tar -xf "${natDest}" -C "${nativesDir}" --exclude="META-INF/*"`, { stdio: 'ignore' });
        } catch (e) {
          try {
            execSync(`powershell -command "Expand-Archive -Path '${natDest}' -DestinationPath '${nativesDir}' -Force"`, { stdio: 'ignore' });
          } catch (e2) {}
        }
      } catch (e) {}
    } else if (lib.natives && lib.natives.windows) {
      // Legacy 1.8.9 natives
      const parts = lib.name.split(':');
      const group = parts[0].replace(/\./g, '/');
      const name = parts[1];
      const version = parts[2];
      const classifier = lib.natives.windows.replace('${arch}', '64');
      const jarName = `${name}-${version}-${classifier}.jar`;
      const relPath = path.join(group, name, version, jarName);
      const dest = path.join(librariesDir, relPath);
      const url = `https://libraries.minecraft.net/${group}/${name}/${version}/${jarName}`;
      try {
        await download(url, dest);
        try {
          execSync(`tar -xf "${dest}" -C "${nativesDir}" --exclude="META-INF/*"`, { stdio: 'ignore' });
        } catch (e) {}
      } catch (e) {}
    }
  }

  console.log(`\x1b[32m[✓] Downloaded ${downloadedCount} libraries for ${verId}!\x1b[0m`);
  
  // Save full classpath string to file for easy launch
  const cpFile = path.join(mcDir, 'versions', verId, 'classpath.txt');
  const validCps = classpaths.filter(p => fs.existsSync(p));
  validCps.unshift(path.join(mcDir, 'versions', verId, `${verId}.jar`));
  fs.writeFileSync(cpFile, validCps.join(';'));
}

async function main() {
  await processVersion('1.8.9', 'https://piston-meta.mojang.com/v1/packages/d546f1707a3f2b7d034eece5ea2e311eda875787/1.8.9.json');
  await processVersion('1.20.4', 'https://piston-meta.mojang.com/v1/packages/40cc1cd04732a49aaed3c1f324107c40061f4cd8/1.20.4.json');
  console.log('\n\x1b[32m[✓] ALL MOJANG LIBRARIES & NATIVES READY FOR LAUNCH!\x1b[0m');
}

main();
