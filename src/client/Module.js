// Base Module Class for SpriteHack Client
export const CATEGORY = {
  COMBAT: 'Combat',
  MOVEMENT: 'Movement',
  RENDER: 'Render',
  PLAYER: 'Player',
  CLIENT: 'Client'
};

export class Module {
  constructor(name, category, description = '', defaultKey = null) {
    this.name = name;
    this.category = category;
    this.description = description;
    this.keybind = defaultKey;
    this.enabled = false;
    this.settings = [];
  }

  addSetting(setting) {
    this.settings.push(setting);
    return setting;
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  setEnabled(state) {
    if (this.enabled === state) return;
    this.enabled = state;
    if (this.enabled) {
      this.onEnable();
    } else {
      this.onDisable();
    }
  }

  onEnable() {}
  onDisable() {}
  onTick(gameContext) {}
  onRender3D(gameContext) {}
  onRender2D(gameContext) {}
}
