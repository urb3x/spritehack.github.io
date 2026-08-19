import { Module, CATEGORY } from '../Module.js';
import { NumberSetting, BooleanSetting, ModeSetting, ColorSetting } from '../Setting.js';

export class FastPlace extends Module {
  constructor() {
    super('FastPlace', CATEGORY.PLAYER, 'Eliminates block placement cooldown for instant rapid-fire placing.', 'KeyP');
  }
  onTick({ player }) {
    player.fastPlace = this.enabled;
  }
}

export class FastBreak extends Module {
  constructor() {
    super('FastBreak', CATEGORY.PLAYER, 'Instantly breaks blocks without mining delay.', 'KeyM');
  }
  onTick({ player }) {
    player.fastBreak = this.enabled;
  }
}

export class NoFall extends Module {
  constructor() {
    super('NoFall', CATEGORY.PLAYER, 'Spoofs on-ground status to completely prevent fall damage.', 'KeyN');
  }
  onTick({ player }) {
    if (this.enabled && player.velocity.y < -0.3) {
      player.velocity.y = -0.05;
    }
  }
}

export class AutoEat extends Module {
  constructor() {
    super('AutoEat', CATEGORY.PLAYER, 'Automatically consumes golden apples and food when hunger drops.');
  }
}

export class ChestStealer extends Module {
  constructor() {
    super('ChestStealer', CATEGORY.PLAYER, 'Instantly loots all items and armor from opened chests in 1 tick.');
  }
}

export class AutoWater extends Module {
  constructor() {
    super('AutoWater', CATEGORY.PLAYER, 'Auto MLG water bucket placement when falling to prevent all fall damage.');
    this.autoPickup = this.addSetting(new BooleanSetting('AutoPickup', true, 'Remove water automatically upon landing'));
    this.clutched = false;
    this.waterPos = null;
  }

  onTick({ player, world, audio }) {
    if (!this.enabled) return;

    const isFalling = player.velocity.y < -0.25 && !player.onGround;

    if (isFalling && !this.clutched) {
      const px = Math.floor(player.position.x);
      const py = Math.floor(player.position.y);
      const pz = Math.floor(player.position.z);

      for (let dy = 1; dy <= 4; dy++) {
        const checkY = py - dy;
        const blockBelow = world.getBlock(px, checkY, pz);
        if (blockBelow !== 0 && blockBelow !== 15) { // NOT AIR & NOT WATER
          const placeY = checkY + 1;
          const placed = world.placeBlock(px, placeY, pz, 15); // WATER = 15
          if (placed) {
            audio.playBlockPlace();
            player.velocity.y = -0.02;
            this.clutched = true;
            this.waterPos = { x: px, y: placeY, z: pz };
          }
          break;
        }
      }
    }

    if (this.clutched && player.onGround) {
      if (this.autoPickup.value && this.waterPos) {
        if (world.getBlock(this.waterPos.x, this.waterPos.y, this.waterPos.z) === 15) {
          world.breakBlock(this.waterPos.x, this.waterPos.y, this.waterPos.z);
        }
      }
      this.clutched = false;
      this.waterPos = null;
    }
  }
}

export class Nuker extends Module {
  constructor() {
    super('Nuker', CATEGORY.PLAYER, 'Mass-mines all blocks in an explosive radius around the player.');
    this.radius = this.addSetting(new NumberSetting('Radius', 3, 1, 6, 1));
    this.mode = this.addSetting(new ModeSetting('Mode', 'All', ['All', 'Floor', 'OreOnly']));
  }

  onTick({ player, world, audio }) {
    if (!this.enabled) return;

    const px = Math.floor(player.position.x);
    const py = Math.floor(player.position.y);
    const pz = Math.floor(player.position.z);
    const r = Math.floor(this.radius.value);

    let brokeAny = false;

    for (let x = -r; x <= r; x++) {
      for (let y = -r; y <= r; y++) {
        for (let z = -r; z <= r; z++) {
          const bx = px + x;
          const by = py + y;
          const bz = pz + z;

          if (this.mode.value === 'Floor' && by >= py) continue;

          const block = world.getBlock(bx, by, bz);
          if (block !== 0 && block !== 10) { // NOT AIR & NOT BEDROCK
            if (this.mode.value === 'OreOnly') {
              const isOre = (block === 7 || block === 8 || block === 9);
              if (!isOre) continue;
            }

            world.breakBlock(bx, by, bz);
            brokeAny = true;
          }
        }
      }
    }

    if (brokeAny && audio) {
      audio.playBlockBreak();
    }
  }
}

export class AutoTool extends Module {
  constructor() {
    super('AutoTool', CATEGORY.PLAYER, 'Automatically selects the optimal tool in hotbar when targeting blocks.');
  }
}

export class AntiAFK extends Module {
  constructor() {
    super('AntiAFK', CATEGORY.PLAYER, 'Periodically walks and jumps to prevent AFK kick from servers.');
    this.lastAction = 0;
  }
  onTick({ player }) {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - this.lastAction > 3000) {
      this.lastAction = now;
      player.yaw += 0.2;
      if (player.onGround) player.velocity.y = 0.2;
    }
  }
}

export class AutoTotem extends Module {
  constructor() {
    super('AutoTotem', CATEGORY.PLAYER, 'Automatically equips Totem of Undying in offhand when low health.');
  }
  onTick({ player }) {
    if (!this.enabled) return;
    if (player.health < 8.0) {
      player.health = Math.min(player.maxHealth, player.health + 0.1);
    }
  }
}

export class Blink extends Module {
  constructor() {
    super('Blink', CATEGORY.PLAYER, 'Suspends position updates to teleport past enemies invisibly.');
  }
}

export class TimerMod extends Module {
  constructor() {
    super('Timer', CATEGORY.PLAYER, 'Modifies game simulation clock speed from 0.2x to 4.0x.');
    this.speed = this.addSetting(new NumberSetting('TickSpeed', 1.5, 0.2, 4.0, 0.1));
  }
}

export class AutoRespawn extends Module {
  constructor() {
    super('AutoRespawn', CATEGORY.PLAYER, 'Instantly clicks respawn button on death.');
  }
}

// Client category modules
export class ClickGUIModule extends Module {
  constructor(spriteHack = null) {
    super('ClickGUI', CATEGORY.CLIENT, 'Toggles the SpriteHack glassmorphic draggable window menu.', 'ShiftRight');
    this.spriteHack = spriteHack;
  }
  setSpriteHack(spriteHack) {
    this.spriteHack = spriteHack;
  }
  onEnable() {
    if (this.spriteHack && this.spriteHack.clickGUI && !this.spriteHack.clickGUI.isOpen) {
      this.spriteHack.clickGUI.open();
    }
  }
  onDisable() {
    if (this.spriteHack && this.spriteHack.clickGUI && this.spriteHack.clickGUI.isOpen) {
      this.spriteHack.clickGUI.close();
    }
  }
}

export class HUDModule extends Module {
  constructor() {
    super('HUD', CATEGORY.CLIENT, 'Displays watermark, FPS, ping, coordinates, and biome tag.');
    this.watermark = this.addSetting(new BooleanSetting('Watermark', true));
    this.coords = this.addSetting(new BooleanSetting('Coordinates', true));
  }
}

export class ArrayListModule extends Module {
  constructor() {
    super('ArrayList', CATEGORY.CLIENT, 'Renders active enabled modules sorted by length with animated gradients.');
    this.colorMode = this.addSetting(new ModeSetting('Color', 'Rainbow', ['Rainbow', 'PurpleWave', 'NeonBlood', 'Emerald', 'Sunset']));
  }
}

export class CustomThemeModule extends Module {
  constructor() {
    super('Theme', CATEGORY.CLIENT, 'Select the UI color palette for ClickGUI and HUD.');
    this.theme = this.addSetting(new ModeSetting('Preset', 'Cyberpunk', ['Cyberpunk', 'NeonBlood', 'EmeraldHaze', 'MidnightIce', 'SunsetGold']));
  }
}
