// SpriteHack Account & Skin Manager
export class AccountManager {
  constructor() {
    this.currentAccount = {
      username: localStorage.getItem('spritehack_username') || 'SpriteHacker',
      type: 'cracked',
      uuid: this.generateOfflineUUID(localStorage.getItem('spritehack_username') || 'SpriteHacker'),
      skinUrl: '',
      cape: localStorage.getItem('spritehack_cape') || 'spritehack'
    };
    this.updateSkinUrls();
  }

  generateOfflineUUID(username) {
    // Generate standard Minecraft offline UUID simulation
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = ((hash << 5) - hash) + username.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.slice(0,8)}-${hex.slice(0,4)}-3${hex.slice(0,3)}-8${hex.slice(0,3)}-${hex.repeat(3).slice(0,12)}`;
  }

  setUsername(name) {
    const trimmed = name.trim().replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16) || 'SpriteHacker';
    this.currentAccount.username = trimmed;
    this.currentAccount.uuid = this.generateOfflineUUID(trimmed);
    this.updateSkinUrls();
    localStorage.setItem('spritehack_username', trimmed);
    return trimmed;
  }

  setCape(capeName) {
    this.currentAccount.cape = capeName;
    localStorage.setItem('spritehack_cape', capeName);
  }

  updateSkinUrls() {
    const user = this.currentAccount.username;
    this.currentAccount.avatarUrl = `https://minotar.net/avatar/${user}/48.png`;
    this.currentAccount.bodyUrl = `https://minotar.net/armor/body/${user}/200.png`;
    this.currentAccount.skinTextureUrl = `https://minotar.net/skin/${user}`;
  }

  getRandomUsername() {
    const prefixes = ['Sprite', 'Vape', 'Crystal', 'Anarchy', 'Void', 'Killaura', 'Matrix', 'Lunar', 'Ghost', 'Zero', 'Apex', 'Phantom'];
    const suffixes = ['God', 'Hacker', 'PvP', 'King', 'Master', 'Lord', 'Demon', 'Striker', 'Beast', '99', '2b2t', 'EZ'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}_${suffix}`;
  }
}
