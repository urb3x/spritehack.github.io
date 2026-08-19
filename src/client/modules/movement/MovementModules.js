import { Module, CATEGORY } from '../Module.js';
import { NumberSetting, BooleanSetting, ModeSetting } from '../Setting.js';
import { BLOCK_TYPES } from '../../game/VoxelWorld.js';

export class Fly extends Module {
  constructor() {
    super('Fly', CATEGORY.MOVEMENT, 'Allows effortless flight with high-speed gliding and creative jetpack modes.', 'KeyF');
    this.speed = this.addSetting(new NumberSetting('Speed', 2.0, 0.5, 6.0, 0.1, 'Flight speed multiplier'));
    this.mode = this.addSetting(new ModeSetting('Mode', 'Vanilla', ['Vanilla', 'Glide', 'Jetpack', 'Creative']));
    this.verticalSpeed = this.addSetting(new NumberSetting('Vertical', 1.5, 0.5, 4.0, 0.1));
  }

  onEnable() {}
  onDisable() {}

  onTick({ player }) {
    if (!this.enabled) {
      player.isFlying = false;
      return;
    }
    player.isFlying = true;
    player.speedMultiplier = this.speed.value;
  }
}

export class Speed extends Module {
  constructor() {
    super('Speed', CATEGORY.MOVEMENT, 'Bunny hop (Bhop) strafe with air acceleration and ground friction bypass.', 'KeyB');
    this.speed = this.addSetting(new NumberSetting('Multiplier', 1.8, 1.0, 4.0, 0.1));
    this.autoJump = this.addSetting(new BooleanSetting('AutoJump', true));
  }

  onTick({ player }) {
    if (!this.enabled) return;
    if (this.autoJump.value && player.onGround) {
      player.velocity.y = player.jumpVelocity * 1.1;
    }
    player.speedMultiplier = this.speed.value;
  }
}

export class Scaffold extends Module {
  constructor() {
    super('Scaffold', CATEGORY.MOVEMENT, 'Automatically places blocks beneath your feet while running or jumping without falling.', 'KeyZ');
    this.tower = this.addSetting(new BooleanSetting('Tower', true, 'Fast upward bridging when holding jump'));
    this.blockType = this.addSetting(new ModeSetting('Block', 'Diamond', ['Diamond', 'Obsidian', 'Bricks', 'Stone']));
  }

  onTick({ player, world, audio }) {
    if (!this.enabled) return;

    const px = Math.floor(player.position.x);
    const py = Math.floor(player.position.y - 0.2);
    const pz = Math.floor(player.position.z);

    // Place block right underneath player if air
    if (world.getBlock(px, py, pz) === BLOCK_TYPES.AIR) {
      let bType = BLOCK_TYPES.DIAMOND_BLOCK;
      if (this.blockType.value === 'Obsidian') bType = BLOCK_TYPES.OBSIDIAN;
      else if (this.blockType.value === 'Bricks') bType = BLOCK_TYPES.BRICK;
      else if (this.blockType.value === 'Stone') bType = BLOCK_TYPES.STONE;

      const placed = world.placeBlock(px, py, pz, bType);
      if (placed) {
        audio.playBlockPlace();
        player.swingHand();
      }
    }

    // Tower mode: jump while placing
    if (this.tower.value && player.keys['Space']) {
      player.velocity.y = 0.22;
    }
  }
}

export class Step extends Module {
  constructor() {
    super('Step', CATEGORY.MOVEMENT, 'Instantly steps up full block heights (up to 2.5 blocks) without jumping.');
    this.height = this.addSetting(new NumberSetting('Height', 1.5, 1.0, 3.0, 0.5));
  }

  onTick({ player }) {
    if (this.enabled) {
      player.stepHeight = this.height.value;
    } else {
      player.stepHeight = 0.6;
    }
  }
}

export class NoClip extends Module {
  constructor() {
    super('NoClip', CATEGORY.MOVEMENT, 'Phase through solid walls, terrain, and blocks seamlessly.', 'KeyX');
  }

  onTick({ player }) {
    player.isNoClip = this.enabled;
  }
  onDisable() {
    // will reset onTick
  }
}

export class Jesus extends Module {
  constructor() {
    super('Jesus', CATEGORY.MOVEMENT, 'Walk on water surfaces as if they were solid bedrock.');
  }
}

export class Spider extends Module {
  constructor() {
    super('Spider', CATEGORY.MOVEMENT, 'Climb vertical walls and mountains like a spider.');
  }
  onTick({ player }) {
    if (this.enabled && (player.velocity.x === 0 || player.velocity.z === 0) && player.keys['KeyW']) {
      player.velocity.y = 0.18;
    }
  }
}

export class AirJump extends Module {
  constructor() {
    super('AirJump', CATEGORY.MOVEMENT, 'Jump infinitely in mid-air.');
  }
  onTick({ player }) {
    if (this.enabled && player.keys['Space']) {
      player.velocity.y = player.jumpVelocity;
    }
  }
}

export class SafeWalk extends Module {
  constructor() {
    super('SafeWalk', CATEGORY.MOVEMENT, 'Prevents player from walking off the edge of blocks.');
  }
}

export class HighJump extends Module {
  constructor() {
    super('HighJump', CATEGORY.MOVEMENT, 'Supercharges jump height up to 5x normal velocity.');
    this.multiplier = this.addSetting(new NumberSetting('Boost', 2.0, 1.2, 5.0, 0.2));
  }
  onTick({ player }) {
    if (this.enabled) player.jumpVelocity = 0.22 * this.multiplier.value;
    else player.jumpVelocity = 0.22;
  }
}
