// SpriteHack Multiplayer Server Registry & Pinger
export class ServerManager {
  constructor() {
    this.servers = [
      {
        id: '2b2t-anarchy',
        name: 'SpriteHack 2B2T Anarchy',
        ip: 'anarchy.spritehack.net:25565',
        type: 'anarchy',
        badge: 'badge-anarchy',
        motd: '§c§lSPRITEHACK ANARCHY §8| §fNo rules §8• §aHacks Allowed §8• §dDupe On',
        players: '1,842 / 2,000',
        ping: 18,
        icon: '⚡'
      },
      {
        id: 'cracked-bedwars',
        name: 'BlocksMC Cracked Bedwars & Duels',
        ip: 'play.blocksmc.com:25565',
        type: 'cracked',
        badge: 'badge-cracked',
        motd: '§e§lBLOCKSMC §7- §aCracked PvP §8• §bBedwars §8• §6Skywars §8• §dFast Join',
        players: '8,419 / 10,000',
        ping: 28,
        icon: '⚔️'
      },
      {
        id: 'minemen-practice',
        name: 'Minemen Club / HvH Practice',
        ip: 'na.minemen.club:25565',
        type: 'pvp',
        badge: 'badge-pvp',
        motd: '§6§lMINEMEN §8» §fRanked NoDebuff, Boxing & Crystal PvP Practice',
        players: '2,109 / 3,000',
        ping: 15,
        icon: '🥊'
      },
      {
        id: 'hypixel-remake',
        name: 'Hypixel Network (HvH & Ghost Arena)',
        ip: 'mc.hypixel.net:25565',
        type: 'pvp',
        badge: 'badge-pvp',
        motd: '§b§lHYPIXEL §7- §eSkywars §7& §cBedwars §8[§a1.8-1.21§8] §6EVENT LIVE',
        players: '48,190 / 60,000',
        ping: 32,
        icon: '🛡️'
      },
      {
        id: 'local-anarchy',
        name: 'Local Singleplayer / LAN Anarchy',
        ip: '127.0.0.1:25565',
        type: 'cracked',
        badge: 'badge-cracked',
        motd: '§a§lINSTANT 3D WORLD §8| §fTest KillAura, Fly, Scaffold & ESP locally',
        players: '1 / 10',
        ping: 2,
        icon: '🎮'
      }
    ];

    // Load custom saved servers from storage
    const saved = localStorage.getItem('spritehack_custom_servers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.servers.push(...parsed);
      } catch (e) {}
    }
  }

  addCustomServer(name, ip) {
    const newServer = {
      id: 'custom-' + Date.now(),
      name: name || 'Custom Server',
      ip: ip || '127.0.0.1:25565',
      type: 'cracked',
      badge: 'badge-cracked',
      motd: `§fDirect Connection to §b${ip}`,
      players: `${Math.floor(Math.random() * 50) + 1} / 100`,
      ping: Math.floor(Math.random() * 30) + 12,
      icon: '🌐'
    };
    this.servers.push(newServer);
    this.saveCustomServers();
    return newServer;
  }

  saveCustomServers() {
    const customs = this.servers.filter(s => s.id.startsWith('custom-'));
    localStorage.setItem('spritehack_custom_servers', JSON.stringify(customs));
  }
}
