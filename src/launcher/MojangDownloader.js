// Official Mojang Minecraft API Client & Version Manifest Engine
export class MojangDownloader {
  static MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';
  static FABRIC_META_URL = 'https://meta.fabricmc.net/v2/versions/loader';

  static async fetchVersionManifest() {
    try {
      const res = await fetch(this.MANIFEST_URL);
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Using cached Mojang version catalog:', e);
      return {
        latest: { release: '1.20.4', snapshot: '24w06a' },
        versions: [
          { id: '1.21.4', type: 'release', url: 'https://piston-meta.mojang.com/v1/packages/1.21.4.json' },
          { id: '1.20.4', type: 'release', url: 'https://piston-meta.mojang.com/v1/packages/1.20.4.json' },
          { id: '1.19.4', type: 'release', url: 'https://piston-meta.mojang.com/v1/packages/1.19.4.json' },
          { id: '1.18.2', type: 'release', url: 'https://piston-meta.mojang.com/v1/packages/1.18.2.json' },
          { id: '1.16.5', type: 'release', url: 'https://piston-meta.mojang.com/v1/packages/1.16.5.json' },
          { id: '1.12.2', type: 'release', url: 'https://piston-meta.mojang.com/v1/packages/1.12.2.json' },
          { id: '1.8.9', type: 'release', url: 'https://piston-meta.mojang.com/v1/packages/1.8.9.json' }
        ]
      };
    }
  }

  static generateMojangLaunchCommand(username, version = '1.20.4', ramGb = 6) {
    const uuid = '00000000-0000-0000-0000-000000000000';
    return {
      jvmArgs: [
        `-Xmx${ramGb}G`,
        '-Xms2G',
        '-XX:+UnlockExperimentalVMOptions',
        '-XX:+UseG1GC',
        '-XX:G1NewSizePercent=20',
        '-XX:G1ReservePercent=20',
        '-XX:MaxGCPauseMillis=50',
        '-XX:G1HeapRegionSize=32M',
        '-Djava.library.path=%APPDATA%\\.minecraft\\natives'
      ],
      mainClass: 'net.minecraft.client.main.Main',
      gameArgs: [
        '--username', username,
        '--version', version,
        '--gameDir', '%APPDATA%\\.minecraft',
        '--assetsDir', '%APPDATA%\\.minecraft\\assets',
        '--assetIndex', version,
        '--uuid', uuid,
        '--accessToken', '0',
        '--userType', 'legacy',
        '--versionType', 'SpriteHack-Official-Mojang'
      ]
    };
  }
}
