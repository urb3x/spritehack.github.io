// Version Manager for SpriteHack: Dedicated 1.8.9 (PvP) and 1.20.4 (Modern Anarchy)
export const SUPPORTED_VERSIONS = [
  {
    id: '1.8.9',
    name: 'Minecraft 1.8.9 (Classic PvP & Bedwars)',
    subtitle: 'Classic 1.8 Combat • No Hit Delay • Block-hitting • Minemen & Hypixel Optimized',
    type: 'pvp_legacy',
    badge: 'badge-pvp',
    icon: '⚔️',
    mojangJarUrl: 'https://launcher.mojang.com/v1/objects/16478950d4b9c1d6ff739bf877f3a8b417dfebaa/client.jar',
    javaVersion: 'Java 8 / 17',
    recommendedPvPServers: ['na.minemen.club:25565', 'play.blocksmc.com:25565', 'mc.hypixel.net:25565']
  },
  {
    id: '1.20.4',
    name: 'Minecraft 1.20.4 (Modern Anarchy & Fabric)',
    subtitle: 'Modern 1.20.4 Engine • Fabric Loader • Crystal PvP • 2B2T Anarchy Ready',
    type: 'anarchy_modern',
    badge: 'badge-anarchy',
    icon: '⚡',
    mojangJarUrl: 'https://piston-data.mojang.com/v1/objects/8448167fb7a4231603da8f8a7142544446c6bd01/client.jar',
    javaVersion: 'Java 17 / 21',
    recommendedPvPServers: ['anarchy.spritehack.net:25565', '127.0.0.1:25565']
  }
];

export class VersionManager {
  constructor() {
    this.selectedVersion = localStorage.getItem('spritehack_selected_version') || '1.20.4';
  }

  getVersion(id) {
    return SUPPORTED_VERSIONS.find(v => v.id === id) || SUPPORTED_VERSIONS[1];
  }

  setVersion(id) {
    this.selectedVersion = id;
    localStorage.setItem('spritehack_selected_version', id);
  }
}
