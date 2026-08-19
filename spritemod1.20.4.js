/**
 * SpriteHack Client v3.5.0 (Single-File Mod Bundle)
 * Combined Standalone Mod: spritemod1.20.4.js
 */

(function(window) {
  'use strict';

  // --- Section: Setting.js ---
// SpriteHack Setting System (Sliders, Checkboxes, Dropdowns, ColorPickers)
class Setting {
  constructor(name, defaultValue, description = '') {
    this.name = name;
    this.value = defaultValue;
    this.defaultValue = defaultValue;
    this.description = description;
    this.onChangeCallback = null;
  }

  onChange(cb) {
    this.onChangeCallback = cb;
    return this;
  }

  setValue(val) {
    this.value = val;
    if (this.onChangeCallback) this.onChangeCallback(val);
  }
}

class BooleanSetting extends Setting {
  constructor(name, defaultValue = false, description = '') {
    super(name, defaultValue, description);
    this.type = 'boolean';
  }

  toggle() {
    this.setValue(!this.value);
    return this.value;
  }
}

class NumberSetting extends Setting {
  constructor(name, defaultValue, min = 0, max = 10, step = 0.1, description = '') {
    super(name, defaultValue, description);
    this.type = 'number';
    this.min = min;
    this.max = max;
    this.step = step;
  }
}

class ModeSetting extends Setting {
  constructor(name, defaultValue, modes = [], description = '') {
    super(name, defaultValue, description);
    this.type = 'mode';
    this.modes = modes;
  }

  cycle() {
    const idx = this.modes.indexOf(this.value);
    const nextIdx = (idx + 1) % this.modes.length;
    this.setValue(this.modes[nextIdx]);
    return this.value;
  }
}

class ColorSetting extends Setting {
  constructor(name, defaultHex = '#9d4edd', description = '') {
    super(name, defaultHex, description);
    this.type = 'color';
  }
}

  // --- Section: Module.js ---
// Base Module Class for SpriteHack Client
const CATEGORY = {
  COMBAT: 'Combat',
  MOVEMENT: 'Movement',
  RENDER: 'Render',
  PLAYER: 'Player',
  CLIENT: 'Client'
};

class Module {
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

  // --- Section: modules/combat/CombatModules.js ---
class KillAura extends Module {
  constructor() {
    super('KillAura', CATEGORY.COMBAT, 'Automatically attacks hostile entities within reach with predictive aimbot.', 'KeyR');
    
    this.range = this.addSetting(new NumberSetting('Range', 4.5, 2.0, 7.0, 0.1, 'Attack reach in blocks'));
    this.cps = this.addSetting(new NumberSetting('CPS', 14, 1, 25, 1, 'Clicks per second'));
    this.targetMode = this.addSetting(new ModeSetting('Mode', 'Single', ['Single', 'Switch', 'Multi'], 'Target selection algorithm'));
    this.autoRotate = this.addSetting(new BooleanSetting('AutoRotate', true, 'Smoothly aims crosshair at target'));
    this.targetPlayers = this.addSetting(new BooleanSetting('Players', true, 'Attack multiplayer players'));
    this.targetMobs = this.addSetting(new BooleanSetting('Mobs', true, 'Attack zombies and monsters'));
    this.criticalsSync = this.addSetting(new BooleanSetting('SyncCrits', true, 'Times hits when falling for critical damage'));

    this.lastAttackTime = 0;
    this.currentTarget = null;
    this.targetRingMesh = null;
  }

  onEnable() {
    if (!this.targetRingMesh) {
      const ringGeom = new THREE.RingGeometry(0.5, 0.6, 24);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0055, side: THREE.DoubleSide });
      this.targetRingMesh = new THREE.Mesh(ringGeom, ringMat);
    }
  }

  onDisable() {
    this.currentTarget = null;
    if (this.targetRingMesh && this.targetRingMesh.parent) {
      this.targetRingMesh.parent.remove(this.targetRingMesh);
    }
  }

  onTick({ player, entityManager, scene, audio }) {
    if (!this.enabled) return;

    let nearest = null;
    let minDist = this.range.value;

    entityManager.entities.forEach(ent => {
      if (ent.isDead) return;
      if (!this.targetPlayers.value && ent.type === 'player') return;
      if (!this.targetMobs.value && ent.type !== 'player') return;

      const dx = ent.position.x - player.position.x;
      const dy = ent.position.y - player.position.y;
      const dz = ent.position.z - player.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= minDist) {
        minDist = dist;
        nearest = ent;
      }
    });

    this.currentTarget = nearest;

    if (this.currentTarget) {
      if (!this.targetRingMesh.parent) scene.add(this.targetRingMesh);
      this.targetRingMesh.position.set(
        this.currentTarget.position.x,
        this.currentTarget.position.y + 0.1,
        this.currentTarget.position.z
      );
      this.targetRingMesh.rotation.y += 0.05;
    } else if (this.targetRingMesh && this.targetRingMesh.parent) {
      this.targetRingMesh.parent.remove(this.targetRingMesh);
    }

    const now = performance.now();
    const attackInterval = 1000 / this.cps.value;

    if (this.currentTarget && (now - this.lastAttackTime >= attackInterval)) {
      this.lastAttackTime = now;

      if (this.autoRotate.value) {
        const dx = this.currentTarget.position.x - player.position.x;
        const dz = this.currentTarget.position.z - player.position.z;
        player.yaw = Math.atan2(-dx, -dz);
      }

      player.swingHand();

      const knockback = new THREE.Vector3(
        this.currentTarget.position.x - player.position.x,
        0.2,
        this.currentTarget.position.z - player.position.z
      ).normalize();

      const damageAmount = this.criticalsSync.value && !player.onGround ? 9.0 : 6.0;
      entityManager.damageEntity(this.currentTarget, damageAmount, knockback);
    }
  }
}

// Dedicated Wallhack Aimbot Module
class Aimbot extends Module {
  constructor() {
    super('Aimbot', CATEGORY.COMBAT, 'Locks crosshair onto enemy heads/bodies with wall-penetrating lock-on tracking.', 'KeyQ');
    
    this.fov = this.addSetting(new NumberSetting('FOV', 180, 30, 360, 10, 'Aim detection angle'));
    this.smoothness = this.addSetting(new NumberSetting('Smoothness', 0.6, 0.0, 1.0, 0.05, 'Aim smoothing (0 = instant snap)'));
    this.targetBone = this.addSetting(new ModeSetting('Target', 'Head', ['Head', 'Chest', 'Feet']));
    this.throughWalls = this.addSetting(new BooleanSetting('WallhackAim', true, 'Lock and track targets directly through walls'));
    this.silentAim = this.addSetting(new BooleanSetting('SilentAim', false, 'Rotates attack vector without moving client camera'));
  }

  onTick({ player, entityManager }) {
    if (!this.enabled) return;

    let bestTarget = null;
    let closestDist = 16.0;

    entityManager.entities.forEach(ent => {
      if (ent.isDead) return;

      const dx = ent.position.x - player.position.x;
      const dy = ent.position.y - player.position.y;
      const dz = ent.position.z - player.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= closestDist) {
        // Calculate required yaw and pitch
        const targetYaw = Math.atan2(-dx, -dz);
        const targetPitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));

        // Check FOV
        let yawDiff = Math.abs(player.yaw - targetYaw) % (Math.PI * 2);
        if (yawDiff > Math.PI) yawDiff = Math.PI * 2 - yawDiff;
        const fovRad = (this.fov.value * Math.PI) / 360;

        if (yawDiff <= fovRad || this.fov.value >= 360) {
          closestDist = dist;
          bestTarget = { ent, targetYaw, targetPitch };
        }
      }
    });

    if (bestTarget) {
      if (!this.silentAim.value) {
        const smooth = this.smoothness.value;
        if (smooth === 0) {
          player.yaw = bestTarget.targetYaw;
          player.pitch = bestTarget.targetPitch;
        } else {
          // Smooth interpolation
          const factor = 1.0 - smooth * 0.85;
          let diffY = bestTarget.targetYaw - player.yaw;
          while (diffY < -Math.PI) diffY += Math.PI * 2;
          while (diffY > Math.PI) diffY -= Math.PI * 2;
          player.yaw += diffY * factor;
          player.pitch += (bestTarget.targetPitch - player.pitch) * factor;
        }
      }
    }
  }
}

class Criticals extends Module {
  constructor() {
    super('Criticals', CATEGORY.COMBAT, 'Spoofs mini-jump motion packets to inflict 100% critical hit damage.', 'KeyC');
    this.packetMode = this.addSetting(new ModeSetting('Mode', 'PacketHop', ['PacketHop', 'MiniJump', 'MotionSpoof']));
  }
}

class Velocity extends Module {
  constructor() {
    super('Velocity', CATEGORY.COMBAT, 'Reduces incoming entity knockback to zero or customizable percentage.', 'KeyV');
    this.horizontal = this.addSetting(new NumberSetting('Horizontal', 0, 0, 100, 5, 'Horizontal KB %'));
    this.vertical = this.addSetting(new NumberSetting('Vertical', 0, 0, 100, 5, 'Vertical KB %'));
  }
}

class TriggerBot extends Module {
  constructor() {
    super('TriggerBot', CATEGORY.COMBAT, 'Automatically swings and hits whenever crosshair hovers over target.');
    this.cps = this.addSetting(new NumberSetting('CPS', 12, 1, 25, 1));
    this.reach = this.addSetting(new NumberSetting('Reach', 4.5, 3.0, 6.0, 0.1));
    this.lastAttackTime = 0;
  }

  onTick({ player, entityManager, audio }) {
    if (!this.enabled) return;

    const now = performance.now();
    const interval = 1000 / this.cps.value;
    if (now - this.lastAttackTime < interval) return;

    const dir = new THREE.Vector3(
      -Math.sin(player.yaw) * Math.cos(player.pitch),
      Math.sin(player.pitch),
      -Math.cos(player.yaw) * Math.cos(player.pitch)
    ).normalize();

    const origin = new THREE.Vector3(player.position.x, player.position.y + 1.62, player.position.z);
    const maxDist = this.reach.value;

    let hitEnt = null;
    let minDist = maxDist;

    entityManager.entities.forEach(ent => {
      if (ent.isDead) return;
      const entPos = new THREE.Vector3(ent.position.x, ent.position.y + 0.9, ent.position.z);
      const toEnt = entPos.clone().sub(origin);
      const projLength = toEnt.dot(dir);

      if (projLength > 0 && projLength <= minDist) {
        const closestPoint = origin.clone().add(dir.clone().multiplyScalar(projLength));
        const perpDist = closestPoint.distanceTo(entPos);
        if (perpDist <= 0.8) {
          minDist = projLength;
          hitEnt = ent;
        }
      }
    });

    if (hitEnt) {
      this.lastAttackTime = now;
      player.swingHand();
      const knockback = dir.clone().multiplyScalar(0.2);
      entityManager.damageEntity(hitEnt, 7.0, knockback);
    }
  }
}

class CrystalAura extends Module {
  constructor() {
    super('CrystalAura', CATEGORY.COMBAT, 'Auto-places End Crystals / TNT next to enemies and detonates them instantly.');
    this.range = this.addSetting(new NumberSetting('Range', 5.0, 2.0, 7.0, 0.1));
    this.cps = this.addSetting(new NumberSetting('CPS', 10, 1, 20, 1));
    this.autoPlace = this.addSetting(new BooleanSetting('AutoPlace', true, 'Automatically place TNT/Crystal blocks'));
    this.lastActionTime = 0;
  }

  onTick({ player, entityManager, world, scene, audio }) {
    if (!this.enabled) return;

    const now = performance.now();
    const interval = 1000 / this.cps.value;
    if (now - this.lastActionTime < interval) return;

    let target = null;
    let minDist = this.range.value;

    entityManager.entities.forEach(ent => {
      if (ent.isDead) return;
      const dist = player.position.distanceTo(ent.position);
      if (dist < minDist) {
        minDist = dist;
        target = ent;
      }
    });

    if (target) {
      this.lastActionTime = now;
      player.swingHand();

      const tx = Math.floor(target.position.x);
      const ty = Math.floor(target.position.y);
      const tz = Math.floor(target.position.z);

      if (this.autoPlace.value) {
        world.placeBlock(tx, ty, tz, 11); // TNT = 11
      }

      const knockback = new THREE.Vector3(
        target.position.x - player.position.x,
        0.4,
        target.position.z - player.position.z
      ).normalize();

      entityManager.damageEntity(target, 12.0, knockback);
      if (audio) audio.playBlockBreak();

      const expGeom = new THREE.SphereGeometry(1.2, 12, 12);
      const expMat = new THREE.MeshBasicMaterial({ color: 0xff5500, wireframe: true, transparent: true, opacity: 0.9 });
      const expMesh = new THREE.Mesh(expGeom, expMat);
      expMesh.position.copy(target.position).add(new THREE.Vector3(0, 0.8, 0));
      scene.add(expMesh);

      setTimeout(() => {
        scene.remove(expMesh);
        expGeom.dispose();
        expMat.dispose();
      }, 200);
    }
  }
}

class SpinBot extends Module {
  constructor() {
    super('SpinBot', CATEGORY.COMBAT, 'CS2 Style Whirlwind Melee SpinBot: 360° rapid anti-aim body rotation with continuous sword slashes.');
    this.speed = this.addSetting(new NumberSetting('SpinSpeed', 8, 1, 20, 1, 'Rotation speed'));
    this.cps = this.addSetting(new NumberSetting('CPS', 16, 1, 25, 1, 'Melee hit speed'));
    this.range = this.addSetting(new NumberSetting('Range', 4.8, 2.0, 6.5, 0.1, 'Attack reach'));
    this.autoMelee = this.addSetting(new BooleanSetting('AutoMelee', true, 'CS2 knifebot auto-hit targets while spinning'));
    this.pitchMode = this.addSetting(new ModeSetting('PitchMode', 'Spin', ['Spin', 'Down', 'Up', 'Flat']));

    this.lastAttackTime = 0;
    this.spinAngle = 0;
  }

  onTick({ player, entityManager, scene, audio }) {
    if (!this.enabled) return;

    // 1. CS2 Anti-Aim 360 Spin Rotation
    this.spinAngle += this.speed.value * 0.2;
    player.yaw = this.spinAngle;

    if (this.pitchMode.value === 'Down') {
      player.pitch = Math.PI / 2 - 0.1;
    } else if (this.pitchMode.value === 'Up') {
      player.pitch = -Math.PI / 2 + 0.1;
    } else if (this.pitchMode.value === 'Spin') {
      player.pitch = Math.sin(performance.now() * 0.015) * 1.3;
    }

    // 2. CS2 Melee Sword Slash Hitbox
    if (!this.autoMelee.value) return;

    const now = performance.now();
    const attackInterval = 1000 / this.cps.value;
    if (now - this.lastAttackTime < attackInterval) return;

    let targetsInReach = [];
    const maxDist = this.range.value;

    entityManager.entities.forEach(ent => {
      if (ent.isDead) return;
      const dist = player.position.distanceTo(ent.position);
      if (dist <= maxDist) {
        targetsInReach.push({ ent, dist });
      }
    });

    if (targetsInReach.length > 0) {
      this.lastAttackTime = now;
      player.swingHand();

      targetsInReach.forEach(({ ent }) => {
        const knockback = new THREE.Vector3(
          ent.position.x - player.position.x,
          0.3,
          ent.position.z - player.position.z
        ).normalize().multiplyScalar(0.3);

        entityManager.damageEntity(ent, 8.5, knockback);
      });

      if (audio) audio.playBlockBreak();

      // Visual CS2 Whirlwind Slash Effect
      const slashGeom = new THREE.RingGeometry(0.8, 1.8, 16);
      slashGeom.rotateX(-Math.PI / 2);
      const slashMat = new THREE.MeshBasicMaterial({ color: 0x2cf2e0, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const slashMesh = new THREE.Mesh(slashGeom, slashMat);
      slashMesh.position.set(player.position.x, player.position.y + 0.8, player.position.z);
      scene.add(slashMesh);

      setTimeout(() => {
        scene.remove(slashMesh);
        slashGeom.dispose();
        slashMat.dispose();
      }, 120);
    }
  }
}

class AutoArmor extends Module {
  constructor() {
    super('AutoArmor', CATEGORY.COMBAT, 'Automatically equips the strongest diamond/netherite armor available.');
  }
}

class Reach extends Module {
  constructor() {
    super('Reach', CATEGORY.COMBAT, 'Extends player combat and interaction reach up to 6.5 blocks.');
    this.reachVal = this.addSetting(new NumberSetting('Distance', 4.8, 3.0, 6.5, 0.1));
  }
  onTick({ player }) {
    if (this.enabled) player.reachDistance = this.reachVal.value;
    else player.reachDistance = 4.5;
  }
}

  // --- Section: modules/movement/MovementModules.js ---
class Fly extends Module {
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

class Speed extends Module {
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

class Scaffold extends Module {
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

class Step extends Module {
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

class NoClip extends Module {
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

class Jesus extends Module {
  constructor() {
    super('Jesus', CATEGORY.MOVEMENT, 'Walk on water surfaces as if they were solid bedrock.');
  }
}

class Spider extends Module {
  constructor() {
    super('Spider', CATEGORY.MOVEMENT, 'Climb vertical walls and mountains like a spider.');
  }
  onTick({ player }) {
    if (this.enabled && (player.velocity.x === 0 || player.velocity.z === 0) && player.keys['KeyW']) {
      player.velocity.y = 0.18;
    }
  }
}

class AirJump extends Module {
  constructor() {
    super('AirJump', CATEGORY.MOVEMENT, 'Jump infinitely in mid-air.');
  }
  onTick({ player }) {
    if (this.enabled && player.keys['Space']) {
      player.velocity.y = player.jumpVelocity;
    }
  }
}

class SafeWalk extends Module {
  constructor() {
    super('SafeWalk', CATEGORY.MOVEMENT, 'Prevents player from walking off the edge of blocks.');
  }
}

class HighJump extends Module {
  constructor() {
    super('HighJump', CATEGORY.MOVEMENT, 'Supercharges jump height up to 5x normal velocity.');
    this.multiplier = this.addSetting(new NumberSetting('Boost', 2.0, 1.2, 5.0, 0.2));
  }
  onTick({ player }) {
    if (this.enabled) player.jumpVelocity = 0.22 * this.multiplier.value;
    else player.jumpVelocity = 0.22;
  }
}

  // --- Section: modules/render/RenderModules.js ---
// Dedicated Wallhack & Chams Module
class Wallhack extends Module {
  constructor() {
    super('Wallhack', CATEGORY.RENDER, 'Renders players, mobs, and chests right through solid walls and terrain with neon glow.', 'KeyU');
    this.playerColor = this.addSetting(new ColorSetting('PlayerGlow', '#00f2fe'));
    this.mobColor = this.addSetting(new ColorSetting('MobGlow', '#ff3366'));
    this.mode = this.addSetting(new ModeSetting('Mode', 'ChamsGlow', ['ChamsGlow', 'Wireframe', 'FlatColor']));
  }

  onTick({ entityManager }) {
    if (!this.enabled) {
      entityManager.entities.forEach(ent => {
        if (ent.meshData && ent.meshData.materials) {
          ent.meshData.materials.forEach(mat => {
            mat.depthTest = true;
            mat.depthWrite = true;
            mat.wireframe = false;
          });
        }
      });
      return;
    }

    // Force all entity materials to bypass depth testing (Wallhack)
    entityManager.entities.forEach(ent => {
      if (ent.isDead || !ent.meshData) return;

      ent.meshData.materials.forEach(mat => {
        mat.depthTest = false; // Renders through walls!
        mat.depthWrite = false;
        if (this.mode.value === 'Wireframe') {
          mat.wireframe = true;
        } else {
          mat.wireframe = false;
        }
      });
    });
  }

  onDisable() {
    // Re-enable standard depth testing
  }
}

class ESP3D extends Module {
  constructor() {
    super('ESP3D', CATEGORY.RENDER, 'Draws 3D wireframe bounding boxes around all players, zombies, and entities.', 'KeyE');
    this.color = this.addSetting(new ColorSetting('BoxColor', '#00f59b'));
    this.showHealth = this.addSetting(new BooleanSetting('HealthBar', true));
    this.throughWalls = this.addSetting(new BooleanSetting('WallhackBoxes', true, 'Show 3D bounding boxes through walls'));
    this.boxLines = [];
  }

  onTick({ entityManager, scene }) {
    if (!this.enabled) {
      this.clearBoxes(scene);
      return;
    }

    this.clearBoxes(scene);

    entityManager.entities.forEach(ent => {
      if (ent.isDead) return;

      const p = ent.position;
      const boxGeom = new THREE.BoxGeometry(0.8, 1.9, 0.8);
      const edges = new THREE.EdgesGeometry(boxGeom);
      
      const hpPercent = ent.health / ent.maxHealth;
      let colHex = 0x00f59b;
      if (hpPercent < 0.35) colHex = 0xff3366;
      else if (hpPercent < 0.7) colHex = 0xffbe0b;

      const lineMat = new THREE.LineBasicMaterial({ 
        color: colHex, 
        linewidth: 2,
        depthTest: !this.throughWalls.value, // Wallhack option!
        depthWrite: false
      });
      const lineBox = new THREE.LineSegments(edges, lineMat);
      lineBox.position.set(p.x, p.y + 0.95, p.z);
      scene.add(lineBox);
      this.boxLines.push(lineBox);
    });
  }

  clearBoxes(scene) {
    this.boxLines.forEach(b => {
      scene.remove(b);
      if (b.geometry) b.geometry.dispose();
      if (b.material) b.material.dispose();
    });
    this.boxLines = [];
  }
}

class Tracers extends Module {
  constructor() {
    super('Tracers', CATEGORY.RENDER, 'Draws direct glowing neon vector lines from your crosshair to nearby entities through walls.', 'KeyT');
    this.lines = [];
  }

  onTick({ player, entityManager, scene }) {
    this.clearLines(scene);
    if (!this.enabled) return;

    const startPos = new THREE.Vector3(player.position.x, player.position.y + 1.2, player.position.z);

    entityManager.entities.forEach(ent => {
      if (ent.isDead) return;
      const endPos = new THREE.Vector3(ent.position.x, ent.position.y + 1.0, ent.position.z);

      const points = [startPos, endPos];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ 
        color: 0x9d4edd, 
        transparent: true, 
        opacity: 0.85,
        depthTest: false // Tracers through walls!
      });
      const line = new THREE.Line(geom, mat);

      scene.add(line);
      this.lines.push(line);
    });
  }

  clearLines(scene) {
    this.lines.forEach(l => {
      scene.remove(l);
      if (l.geometry) l.geometry.dispose();
    });
    this.lines = [];
  }
}

class Fullbright extends Module {
  constructor() {
    super('Fullbright', CATEGORY.RENDER, 'Maxes out scene gamma & ambient illumination to see clearly in dark caves.', 'KeyH');
  }
  onTick({ ambientLight }) {
    if (this.enabled && ambientLight) {
      ambientLight.intensity = 2.5;
    } else if (ambientLight) {
      ambientLight.intensity = 0.8;
    }
  }
}

class XRay extends Module {
  constructor() {
    super('XRay', CATEGORY.RENDER, 'X-Ray highlights diamond ores, iron, coal, TNT, and obsidian through solid terrain walls.', 'KeyX');
    this.radius = this.addSetting(new NumberSetting('Radius', 16, 8, 32, 2));
    this.showDiamonds = this.addSetting(new BooleanSetting('Diamonds', true));
    this.showIron = this.addSetting(new BooleanSetting('Iron', true));
    this.showCoal = this.addSetting(new BooleanSetting('Coal', true));
    this.showTNT = this.addSetting(new BooleanSetting('TNT', true));
    this.showObsidian = this.addSetting(new BooleanSetting('Obsidian', true));

    this.boxes = [];
  }

  onTick({ player, world, scene }) {
    this.clearBoxes(scene);
    if (!this.enabled) return;

    const px = Math.floor(player.position.x);
    const py = Math.floor(player.position.y);
    const pz = Math.floor(player.position.z);
    const r = Math.floor(this.radius.value);

    const boxGeom = new THREE.BoxGeometry(1.02, 1.02, 1.02);
    const edges = new THREE.EdgesGeometry(boxGeom);

    for (let x = -r; x <= r; x++) {
      for (let y = -r; y <= r; y++) {
        for (let z = -r; z <= r; z++) {
          const bx = px + x;
          const by = py + y;
          const bz = pz + z;

          const block = world.getBlock(bx, by, bz);
          let colHex = null;

          if (block === 7 && this.showDiamonds.value) colHex = 0x00f2fe;
          else if (block === 8 && this.showIron.value) colHex = 0xffa500;
          else if (block === 9 && this.showCoal.value) colHex = 0x888888;
          else if (block === 11 && this.showTNT.value) colHex = 0xff2200;
          else if (block === 14 && this.showObsidian.value) colHex = 0xa020f0;

          if (colHex !== null) {
            const lineMat = new THREE.LineBasicMaterial({
              color: colHex,
              linewidth: 2,
              depthTest: false,
              depthWrite: false
            });
            const lineBox = new THREE.LineSegments(edges, lineMat);
            lineBox.position.set(bx + 0.5, by + 0.5, bz + 0.5);
            scene.add(lineBox);
            this.boxes.push(lineBox);
          }
        }
      }
    }
  }

  clearBoxes(scene) {
    this.boxes.forEach(b => {
      scene.remove(b);
      if (b.geometry) b.geometry.dispose();
      if (b.material) b.material.dispose();
    });
    this.boxes = [];
  }
}

class Trajectories extends Module {
  constructor() {
    super('Trajectories', CATEGORY.RENDER, 'Predicts and draws glowing parabolic 3D trajectory lines for thrown items/TNT.');
    this.lineMesh = null;
    this.targetMarker = null;
  }

  onTick({ player, world, scene }) {
    this.clearTrajectory(scene);
    if (!this.enabled) return;

    const points = [];
    const origin = new THREE.Vector3(player.position.x, player.position.y + 1.62, player.position.z);
    const vel = new THREE.Vector3(
      -Math.sin(player.yaw) * Math.cos(player.pitch),
      Math.sin(player.pitch),
      -Math.cos(player.yaw) * Math.cos(player.pitch)
    ).multiplyScalar(0.9);

    const pos = origin.clone();
    points.push(pos.clone());

    let hitPos = null;

    for (let step = 0; step < 60; step++) {
      pos.add(vel);
      vel.y -= 0.015;
      points.push(pos.clone());

      const bx = Math.floor(pos.x);
      const by = Math.floor(pos.y);
      const bz = Math.floor(pos.z);

      const block = world.getBlock(bx, by, bz);
      if (block !== 0) {
        hitPos = pos.clone();
        break;
      }
    }

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 3, depthTest: false });
    this.lineMesh = new THREE.Line(geom, mat);
    scene.add(this.lineMesh);

    if (hitPos) {
      const markerGeom = new THREE.BoxGeometry(0.4, 0.4, 0.4);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xff0055, wireframe: true, depthTest: false });
      this.targetMarker = new THREE.Mesh(markerGeom, markerMat);
      this.targetMarker.position.copy(hitPos);
      scene.add(this.targetMarker);
    }
  }

  clearTrajectory(scene) {
    if (this.lineMesh) {
      scene.remove(this.lineMesh);
      if (this.lineMesh.geometry) this.lineMesh.geometry.dispose();
      if (this.lineMesh.material) this.lineMesh.material.dispose();
      this.lineMesh = null;
    }
    if (this.targetMarker) {
      scene.remove(this.targetMarker);
      if (this.targetMarker.geometry) this.targetMarker.geometry.dispose();
      if (this.targetMarker.material) this.targetMarker.material.dispose();
      this.targetMarker = null;
    }
  }
}

class Freecam extends Module {
  constructor() {
    super('Freecam', CATEGORY.RENDER, 'Detaches camera to fly around freely in 3D noclip mode while keeping player body safe.');
    this.speed = this.addSetting(new NumberSetting('Speed', 2.5, 0.5, 6.0, 0.5));
  }

  onEnable() {}

  onTick({ player }) {
    if (!this.enabled) {
      player.isFreecamActive = false;
      return;
    }

    if (!player.isFreecamActive) {
      player.isFreecamActive = true;
      player.freecamPos = new THREE.Vector3(player.position.x, player.position.y + 1.62, player.position.z);
      player.freecamYaw = player.yaw;
      player.freecamPitch = player.pitch;
    }

    // 3D Noclip Flight math using freecamYaw and freecamPitch
    const speed = 0.12 * this.speed.value;
    const forward = new THREE.Vector3(
      -Math.sin(player.freecamYaw) * Math.cos(player.freecamPitch),
      Math.sin(player.freecamPitch),
      -Math.cos(player.freecamYaw) * Math.cos(player.freecamPitch)
    ).normalize();

    const right = new THREE.Vector3(
      Math.cos(player.freecamYaw),
      0,
      -Math.sin(player.freecamYaw)
    ).normalize();

    if (player.keys['KeyW']) player.freecamPos.add(forward.clone().multiplyScalar(speed));
    if (player.keys['KeyS']) player.freecamPos.sub(forward.clone().multiplyScalar(speed));
    if (player.keys['KeyD']) player.freecamPos.add(right.clone().multiplyScalar(speed));
    if (player.keys['KeyA']) player.freecamPos.sub(right.clone().multiplyScalar(speed));
    if (player.keys['Space']) player.freecamPos.y += speed;
    if (player.keys['ShiftLeft'] || player.keys['KeyC']) player.freecamPos.y -= speed;
  }

  onDisable() {
    // Cleanly restore camera tracking to player
  }
}

class Perspective extends Module {
  constructor() {
    super('Perspective', CATEGORY.RENDER, 'Freelook camera: Mouse rotates camera orbit around character while WASD movement works.', 'F5');
    this.mode = this.addSetting(new ModeSetting('Mode', 'ThirdPersonBack', ['ThirdPersonBack', 'ThirdPersonFront', 'FirstPerson']));
    this.distance = this.addSetting(new NumberSetting('Distance', 3.5, 1.5, 8.0, 0.5));
  }

  onTick({ player }) {
    if (!this.enabled || this.mode.value === 'FirstPerson') {
      player.isPerspectiveActive = false;
      player.perspectiveMode = 'FirstPerson';
      return;
    }

    if (!player.isPerspectiveActive) {
      player.isPerspectiveActive = true;
      player.perspectiveYaw = player.yaw;
      player.perspectivePitch = player.pitch;
    }

    player.perspectiveMode = this.mode.value;
    player.thirdPersonDistance = this.distance.value;
  }

  onDisable() {}
}

class BlockESP extends Module {
  constructor() {
    super('BlockESP', CATEGORY.RENDER, 'X-Ray highlights diamond ores, iron, and chests through stone layers.', 'KeyX');
  }
}

class Breadcrumbs extends Module {
  constructor() {
    super('Breadcrumbs', CATEGORY.RENDER, 'Leaves an animated neon particle path along your movement trajectory.');
  }
}

class Nametags extends Module {
  constructor() {
    super('Nametags', CATEGORY.RENDER, 'Renders scaled health, distance, and player names over entities.');
  }
}

class TargetHUD extends Module {
  constructor() {
    super('TargetHUD', CATEGORY.RENDER, 'Displays an elegant popup widget with current target avatar, health, and distance.');
  }
}

  // --- Section: modules/player/PlayerModules.js ---
class FastPlace extends Module {
  constructor() {
    super('FastPlace', CATEGORY.PLAYER, 'Eliminates block placement cooldown for instant rapid-fire placing.', 'KeyP');
  }
  onTick({ player }) {
    player.fastPlace = this.enabled;
  }
}

class FastBreak extends Module {
  constructor() {
    super('FastBreak', CATEGORY.PLAYER, 'Instantly breaks blocks without mining delay.', 'KeyM');
  }
  onTick({ player }) {
    player.fastBreak = this.enabled;
  }
}

class NoFall extends Module {
  constructor() {
    super('NoFall', CATEGORY.PLAYER, 'Spoofs on-ground status to completely prevent fall damage.', 'KeyN');
  }
  onTick({ player }) {
    if (this.enabled && player.velocity.y < -0.3) {
      player.velocity.y = -0.05;
    }
  }
}

class AutoEat extends Module {
  constructor() {
    super('AutoEat', CATEGORY.PLAYER, 'Automatically consumes golden apples and food when hunger drops.');
  }
}

class ChestStealer extends Module {
  constructor() {
    super('ChestStealer', CATEGORY.PLAYER, 'Instantly loots all items and armor from opened chests in 1 tick.');
  }
}

class AutoWater extends Module {
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

class Nuker extends Module {
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

class AutoTool extends Module {
  constructor() {
    super('AutoTool', CATEGORY.PLAYER, 'Automatically selects the optimal tool in hotbar when targeting blocks.');
  }
}

class AntiAFK extends Module {
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

class AutoTotem extends Module {
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

class Blink extends Module {
  constructor() {
    super('Blink', CATEGORY.PLAYER, 'Suspends position updates to teleport past enemies invisibly.');
  }
}

class TimerMod extends Module {
  constructor() {
    super('Timer', CATEGORY.PLAYER, 'Modifies game simulation clock speed from 0.2x to 4.0x.');
    this.speed = this.addSetting(new NumberSetting('TickSpeed', 1.5, 0.2, 4.0, 0.1));
  }
}

class AutoRespawn extends Module {
  constructor() {
    super('AutoRespawn', CATEGORY.PLAYER, 'Instantly clicks respawn button on death.');
  }
}

// Client category modules
class ClickGUIModule extends Module {
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

class HUDModule extends Module {
  constructor() {
    super('HUD', CATEGORY.CLIENT, 'Displays watermark, FPS, ping, coordinates, and biome tag.');
    this.watermark = this.addSetting(new BooleanSetting('Watermark', true));
    this.coords = this.addSetting(new BooleanSetting('Coordinates', true));
  }
}

class ArrayListModule extends Module {
  constructor() {
    super('ArrayList', CATEGORY.CLIENT, 'Renders active enabled modules sorted by length with animated gradients.');
    this.colorMode = this.addSetting(new ModeSetting('Color', 'Rainbow', ['Rainbow', 'PurpleWave', 'NeonBlood', 'Emerald', 'Sunset']));
  }
}

class CustomThemeModule extends Module {
  constructor() {
    super('Theme', CATEGORY.CLIENT, 'Select the UI color palette for ClickGUI and HUD.');
    this.theme = this.addSetting(new ModeSetting('Preset', 'Cyberpunk', ['Cyberpunk', 'NeonBlood', 'EmeraldHaze', 'MidnightIce', 'SunsetGold']));
  }
}

  // --- Section: gui/NotificationManager.js ---
class NotificationManager {
  constructor() {
    this.container = document.getElementById('notification-container');
  }

  show(title, message, type = 'info') {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `wurst-toast ${type === 'disabled' ? 'disabled' : ''}`;
    
    let icon = '⚡';
    if (type === 'success') icon = '✓';
    else if (type === 'disabled') icon = '✕';

    toast.innerHTML = `
      <span style="font-weight: 900; color: ${type === 'disabled' ? 'var(--wurst-red)' : 'var(--wurst-green)'};">${icon}</span>
      <div>
        <span style="font-weight: 800; color: #fff;">${title}</span>
        <span style="font-size: 11px; color: #9ca3af; margin-left: 4px;">${message}</span>
      </div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.2s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 200);
    }, 2000);
  }
}

  // --- Section: gui/HUD.js ---
class HUD {
  constructor(spriteHack) {
    this.client = spriteHack;
    this.arraylistContainer = document.getElementById('hud-arraylist');
    this.targetHud = document.getElementById('target-hud');
    this.fpsEl = document.getElementById('hud-fps-val');
    this.coordsEl = document.getElementById('hud-coords-val');

    this.frameCount = 0;
    this.lastFpsTime = performance.now();
    this.currentFps = 60;
  }

  onTick({ player }) {
    // 1. Calculate FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = now;
      if (this.fpsEl) this.fpsEl.textContent = this.currentFps;
    }

    // 2. Coordinates
    if (this.coordsEl && player) {
      const px = Math.floor(player.position.x);
      const py = Math.floor(player.position.y);
      const pz = Math.floor(player.position.z);
      this.coordsEl.textContent = `${px} / ${py} / ${pz}`;
    }

    // 3. TargetHUD
    const aura = this.client.getModule('KillAura');
    const aim = this.client.getModule('Aimbot');
    const target = (aura && aura.enabled && aura.currentTarget) || null;

    if (target && this.targetHud) {
      this.targetHud.classList.add('active');
      const nameEl = document.getElementById('target-hud-name');
      const hpBar = document.getElementById('target-hud-health');
      const hpNum = document.getElementById('target-hud-hp-num');
      const distNum = document.getElementById('target-hud-dist-num');

      if (nameEl) nameEl.textContent = target.name;
      if (hpNum) hpNum.textContent = target.health.toFixed(1);
      
      const hpPercent = Math.max(0, Math.min(100, (target.health / target.maxHealth) * 100));
      if (hpBar) hpBar.style.width = `${hpPercent}%`;

      const dx = target.position.x - player.position.x;
      const dz = target.position.z - player.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (distNum) distNum.textContent = `${dist.toFixed(1)}m`;
    } else if (this.targetHud) {
      this.targetHud.classList.remove('active');
    }
  }

  updateArrayList() {
    if (!this.arraylistContainer) return;
    this.arraylistContainer.innerHTML = '';

    const active = this.client.modules
      .filter(m => m.enabled && m.category !== 'Client')
      .sort((a, b) => b.name.length - a.name.length);

    active.forEach((mod, idx) => {
      const item = document.createElement('div');
      item.className = 'wurst-array-item';
      
      // Wurst green / neon rainbow wave
      const hue = (idx * 28 + performance.now() * 0.04) % 360;
      item.style.borderRightColor = `hsl(${hue}, 90%, 55%)`;
      item.style.color = `#fff`;

      item.innerHTML = `<span>${mod.name}</span>`;
      this.arraylistContainer.appendChild(item);
    });
  }
}

  // --- Section: gui/TabGUI.js ---
// Wurst-Inspired TabGUI (Keyboard Arrow-Key Navigation on Top-Left HUD)

class TabGUI {
  constructor(spriteHack) {
    this.client = spriteHack;
    this.categories = [CATEGORY.COMBAT, CATEGORY.MOVEMENT, CATEGORY.RENDER, CATEGORY.PLAYER, CATEGORY.CLIENT];
    
    this.selectedCatIdx = 0;
    this.selectedModIdx = 0;
    this.isSubMenuOpen = false;

    this.container = null;
    this.initDOM();
    this.initKeyListeners();
    this.render();
  }

  initDOM() {
    let el = document.getElementById('wurst-tabgui');
    if (!el) {
      el = document.createElement('div');
      el.id = 'wurst-tabgui';
      el.className = 'wurst-tabgui';
      const hudLayer = document.querySelector('.hud-layer') || document.body;
      hudLayer.appendChild(el);
    }
    this.container = el;
  }

  initKeyListeners() {
    window.addEventListener('keydown', (e) => {
      // Don't intercept when typing in text inputs or chat
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (this.client.clickGUI && this.client.clickGUI.isOpen) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.isSubMenuOpen) {
          const mods = this.getCurrentCategoryModules();
          this.selectedModIdx = (this.selectedModIdx - 1 + mods.length) % mods.length;
        } else {
          this.selectedCatIdx = (this.selectedCatIdx - 1 + this.categories.length) % this.categories.length;
        }
        this.render();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.isSubMenuOpen) {
          const mods = this.getCurrentCategoryModules();
          this.selectedModIdx = (this.selectedModIdx + 1) % mods.length;
        } else {
          this.selectedCatIdx = (this.selectedCatIdx + 1) % this.categories.length;
        }
        this.render();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!this.isSubMenuOpen) {
          this.isSubMenuOpen = true;
          this.selectedModIdx = 0;
          this.render();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (this.isSubMenuOpen) {
          this.isSubMenuOpen = false;
          this.render();
        }
      } else if (e.key === 'Enter') {
        if (this.isSubMenuOpen) {
          e.preventDefault();
          const mods = this.getCurrentCategoryModules();
          const mod = mods[this.selectedModIdx];
          if (mod) {
            this.client.toggleModule(mod);
            this.render();
          }
        }
      }
    });
  }

  getCurrentCategoryModules() {
    const cat = this.categories[this.selectedCatIdx];
    return this.client.modules.filter(m => m.category === cat);
  }

  render() {
    if (!this.container) return;

    const currentCat = this.categories[this.selectedCatIdx];
    const catModules = this.client.modules.filter(m => m.category === currentCat);

    let catsHtml = '<div class="tabgui-categories">';
    this.categories.forEach((cat, idx) => {
      const isSel = idx === this.selectedCatIdx;
      catsHtml += `
        <div class="tabgui-item ${isSel ? 'selected' : ''}">
          <span>${cat}</span>
          <span style="font-size: 9px; opacity: 0.6;">${isSel ? '►' : ''}</span>
        </div>
      `;
    });
    catsHtml += '</div>';

    let modsHtml = `<div class="tabgui-modules ${this.isSubMenuOpen ? 'active' : ''}">`;
    catModules.forEach((mod, idx) => {
      const isSel = idx === this.selectedModIdx && this.isSubMenuOpen;
      modsHtml += `
        <div class="tabgui-mod-item ${isSel ? 'selected' : ''} ${mod.enabled ? 'enabled' : ''}">
          <span>${mod.name}</span>
          <span>${mod.enabled ? '✓' : ''}</span>
        </div>
      `;
    });
    modsHtml += '</div>';

    this.container.innerHTML = catsHtml + modsHtml;
  }
}

  // --- Section: gui/ClickGUI.js ---
// Wurst-Style ClickGUI Window Manager & Navigator

class ClickGUI {
  constructor(spriteHack) {
    this.client = spriteHack;
    this.container = document.getElementById('clickgui-view');
    this.isOpen = false;
    this.rebindingModule = null;
    this.searchQuery = '';

    this.initDOM();
    this.initKeybindListener();
    this.rebuildPanels();
  }

  initDOM() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'clickgui-view';
      this.container.className = 'wurst-clickgui-overlay';
      document.body.appendChild(this.container);
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    if (this.container) {
      this.container.classList.add('active');
      this.container.style.display = 'block';
    }
    if (document.exitPointerLock) document.exitPointerLock();
    const mod = this.client.getModule('ClickGUI');
    if (mod && !mod.enabled) {
      mod.enabled = true;
      this.client.hud.updateArrayList();
    }
  }

  close() {
    this.isOpen = false;
    if (this.container) {
      this.container.classList.remove('active');
      this.container.style.display = 'none';
    }
    const mod = this.client.getModule('ClickGUI');
    if (mod && mod.enabled) {
      mod.enabled = false;
      this.client.hud.updateArrayList();
    }
  }

  initKeybindListener() {
    window.addEventListener('keydown', (e) => {
      if (this.rebindingModule) {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'Escape') {
          this.rebindingModule.keybind = null;
        } else {
          this.rebindingModule.keybind = e.code;
        }
        const mod = this.rebindingModule;
        this.rebindingModule = null;
        this.client.saveConfig();
        this.updateModuleUI(mod);
      }
    }, true);
  }

  rebuildPanels() {
    if (!this.container) return;

    this.container.innerHTML = `
      <!-- Wurst Top Navigator Bar -->
      <div class="wurst-navigator-bar">
        <div class="navigator-brand">
          <span>⚡ SpriteHack Navigator</span>
          <span style="font-size: 11px; background: var(--wurst-green); color: #000; font-weight: 800; padding: 2px 6px; border-radius: 3px;">WURST EDITION</span>
        </div>
        <div class="navigator-search">
          <span style="margin-right: 6px; font-size: 12px; color: var(--text-dim);">🔍</span>
          <input type="text" id="wurst-search-input" placeholder="Search hacks (e.g. killaura, fly, wallhack)..." value="${this.searchQuery}">
        </div>
        <div class="navigator-actions">
          <button class="btn-wurst-action" id="btn-close-gui">
            <span>✕</span> Close (R-Shift / ESC)
          </button>
        </div>
      </div>

      <!-- Draggable Category Windows -->
      <div class="wurst-windows-container" id="wurst-windows"></div>
    `;

    const searchInput = this.container.querySelector('#wurst-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCategoryWindows();
      });
    }

    const closeBtn = this.container.querySelector('#btn-close-gui');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    this.renderCategoryWindows();
  }

  renderCategoryWindows() {
    const windowsContainer = this.container.querySelector('#wurst-windows');
    if (!windowsContainer) return;
    windowsContainer.innerHTML = '';

    const categories = [CATEGORY.COMBAT, CATEGORY.MOVEMENT, CATEGORY.RENDER, CATEGORY.PLAYER, CATEGORY.CLIENT];

    categories.forEach(cat => {
      let catMods = this.client.modules.filter(m => m.category === cat);
      if (this.searchQuery) {
        catMods = catMods.filter(m => m.name.toLowerCase().includes(this.searchQuery) || m.description.toLowerCase().includes(this.searchQuery));
      }

      if (catMods.length === 0 && this.searchQuery) return;

      const win = document.createElement('div');
      win.className = 'wurst-window';

      const catClass = cat.toLowerCase();
      let icon = '⚡';
      if (cat === CATEGORY.COMBAT) icon = '⚔️';
      else if (cat === CATEGORY.MOVEMENT) icon = '🏃';
      else if (cat === CATEGORY.RENDER) icon = '👁️';
      else if (cat === CATEGORY.PLAYER) icon = '🛠️';
      else if (cat === CATEGORY.CLIENT) icon = '⚙️';

      win.innerHTML = `
        <div class="wurst-window-header ${catClass}">
          <span>${icon} ${cat}</span>
          <span style="font-size: 10px; color: var(--text-dim);">_</span>
        </div>
        <div class="wurst-modules-list" id="wurst-list-${catClass}"></div>
      `;

      const listEl = win.querySelector(`#wurst-list-${catClass}`);
      catMods.forEach(mod => {
        const item = this.createModuleItem(mod);
        listEl.appendChild(item);
      });

      windowsContainer.appendChild(win);
    });
  }

  createModuleItem(mod) {
    const item = document.createElement('div');
    item.className = `wurst-mod-item ${mod.enabled ? 'enabled' : ''}`;
    item.id = `wurst-mod-${mod.name.toLowerCase()}`;

    const keyLabel = mod.keybind ? mod.keybind.replace('Key', '').replace('Digit', '') : '';

    item.innerHTML = `
      <div class="wurst-mod-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="wurst-checkbox ${mod.enabled ? 'checked' : ''}"></div>
          <span class="wurst-mod-name">${mod.name}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          ${keyLabel ? `<span class="wurst-mod-bind" id="bind-${mod.name.toLowerCase()}">[${keyLabel}]</span>` : ''}
          ${mod.settings.length > 0 ? `<span class="btn-toggle-drawer" style="font-size: 10px; color: var(--text-dim); padding: 2px;">⚙️</span>` : ''}
        </div>
      </div>
      <div class="wurst-settings-drawer" id="drawer-${mod.name.toLowerCase()}" style="display: none;"></div>
    `;

    const header = item.querySelector('.wurst-mod-header');
    header.addEventListener('click', (e) => {
      if (e.target.classList.contains('wurst-mod-bind')) {
        this.startRebinding(mod, e.target);
        return;
      }
      if (e.target.classList.contains('btn-toggle-drawer')) {
        const drawer = item.querySelector('.wurst-settings-drawer');
        drawer.style.display = drawer.style.display === 'none' ? 'flex' : 'none';
        return;
      }
      this.client.toggleModule(mod);
    });

    // Populate Sub-settings
    const drawer = item.querySelector('.wurst-settings-drawer');
    if (mod.settings.length > 0) {
      mod.settings.forEach(s => {
        drawer.appendChild(this.createSettingElement(s));
      });
    }

    return item;
  }

  createSettingElement(setting) {
    const row = document.createElement('div');

    if (setting.type === 'number') {
      row.className = 'wurst-slider-row';
      row.innerHTML = `
        <div class="wurst-slider-label">
          <span>${setting.name}</span>
          <span id="val-${setting.name}">${setting.value}</span>
        </div>
        <input type="range" class="wurst-slider" min="${setting.min}" max="${setting.max}" step="${setting.step}" value="${setting.value}">
      `;
      const slider = row.querySelector('input');
      const valLabel = row.querySelector(`#val-${setting.name}`);
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        setting.setValue(val);
        valLabel.textContent = val;
        this.client.saveConfig();
      });
    } else if (setting.type === 'boolean') {
      row.className = 'wurst-toggle-row';
      row.innerHTML = `
        <span>${setting.name}</span>
        <div class="wurst-checkbox ${setting.value ? 'checked' : ''}"></div>
      `;
      row.addEventListener('click', () => {
        const newVal = setting.toggle();
        const box = row.querySelector('.wurst-checkbox');
        if (newVal) box.classList.add('checked');
        else box.classList.remove('checked');
        this.client.saveConfig();
      });
    } else if (setting.type === 'mode') {
      row.className = 'wurst-toggle-row';
      row.innerHTML = `
        <span>${setting.name}</span>
        <span style="color: var(--wurst-green); font-weight: 700;">${setting.value}</span>
      `;
      row.addEventListener('click', () => {
        const nextVal = setting.cycle();
        row.querySelector('span:last-child').textContent = nextVal;
        this.client.saveConfig();
      });
    }

    return row;
  }

  startRebinding(mod, el) {
    this.rebindingModule = mod;
    el.textContent = '[...]';
    el.style.color = '#ef4444';
  }

  updateModuleUI(mod) {
    const item = document.getElementById(`wurst-mod-${mod.name.toLowerCase()}`);
    if (item) {
      if (mod.enabled) item.classList.add('enabled');
      else item.classList.remove('enabled');

      const checkbox = item.querySelector('.wurst-checkbox');
      if (checkbox) {
        if (mod.enabled) checkbox.classList.add('checked');
        else checkbox.classList.remove('checked');
      }

      const bindEl = item.querySelector('.wurst-mod-bind');
      if (bindEl) {
        const keyLabel = mod.keybind ? mod.keybind.replace('Key', '').replace('Digit', '') : '';
        bindEl.textContent = `[${keyLabel}]`;
        bindEl.style.color = '';
      }
    }
  }
}

  // --- Section: SpriteHack.js ---
class SpriteHack {
  constructor(audioEngine) {
    this.audio = audioEngine;
    this.modules = [];
    this.moduleMap = new Map();
    this.notifications = new NotificationManager();

    this.registerModules();
    this.clickGUI = new ClickGUI(this);
    this.tabGUI = new TabGUI(this);
    this.hud = new HUD(this);

    this.initKeyListeners();
    this.loadConfig();

    window.addEventListener('beforeunload', () => this.saveConfig());
  }

  register(mod) {
    this.modules.push(mod);
    this.moduleMap.set(mod.name.toLowerCase(), mod);
  }

  registerModules() {
    // Combat
    this.register(new KillAura());
    this.register(new Aimbot());
    this.register(new Criticals());
    this.register(new Velocity());
    this.register(new TriggerBot());
    this.register(new CrystalAura());
    this.register(new SpinBot());
    this.register(new AutoArmor());
    this.register(new Reach());

    // Movement
    this.register(new Fly());
    this.register(new Speed());
    this.register(new Scaffold());
    this.register(new Step());
    this.register(new NoClip());
    this.register(new Jesus());
    this.register(new Spider());
    this.register(new AirJump());
    this.register(new SafeWalk());
    this.register(new HighJump());

    // Render
    this.register(new Wallhack());
    this.register(new ESP3D());
    this.register(new Tracers());
    this.register(new Fullbright());
    this.register(new Freecam());
    this.register(new Perspective());
    this.register(new BlockESP());
    this.register(new XRay());
    this.register(new Trajectories());
    this.register(new Breadcrumbs());
    this.register(new Nametags());
    this.register(new TargetHUD());

    // Player / Blocks
    this.register(new FastPlace());
    this.register(new FastBreak());
    this.register(new NoFall());
    this.register(new AutoWater());
    this.register(new AutoEat());
    this.register(new ChestStealer());
    this.register(new Nuker());
    this.register(new AutoTool());
    this.register(new AntiAFK());
    this.register(new AutoTotem());
    this.register(new Blink());
    this.register(new TimerMod());
    this.register(new AutoRespawn());

    // Client / Other
    this.register(new ClickGUIModule(this));
    this.register(new HUDModule());
    this.register(new ArrayListModule());
    this.register(new CustomThemeModule());

    // Default enables
    this.getModule('HUD').setEnabled(true);
    this.getModule('ArrayList').setEnabled(true);
    this.getModule('Fullbright').setEnabled(true);
    this.getModule('Wallhack').setEnabled(true);
    this.getModule('Aimbot').setEnabled(true);
    this.getModule('ESP3D').setEnabled(true);
  }

  getModule(name) {
    return this.moduleMap.get(name.toLowerCase());
  }

  toggleModule(mod) {
    const newState = mod.toggle();
    if (this.audio) this.audio.playToggleClick(newState);
    this.notifications.show(
      mod.name,
      newState ? 'Enabled' : 'Disabled',
      newState ? 'success' : 'disabled'
    );
    this.hud.updateArrayList();
    if (this.tabGUI) this.tabGUI.render();
    if (this.clickGUI) this.clickGUI.updateModuleUI(mod);
    this.saveConfig();
    return newState;
  }

  isRightShiftKey(e) {
    return (
      e.code === 'ShiftRight' ||
      e.code === 'RightShift' ||
      e.key === 'ShiftRight' ||
      e.key === 'RightShift' ||
      (e.key === 'Shift' && e.location === 2) ||
      (e.keyCode === 16 && e.location === 2) ||
      (e.which === 16 && e.location === 2)
    );
  }

  initKeyListeners() {
    window.addEventListener('keydown', (e) => {
      const isRightShift = this.isRightShiftKey(e);
      const isKeyU = (e.code === 'KeyU' || e.key === 'u' || e.key === 'U');
      const isCtrlLeft = (e.code === 'ControlLeft' || e.key === 'Control');

      // 1. Right Shift / U / ControlLeft for Wurst ClickGUI
      if (isRightShift || isKeyU || (isCtrlLeft && !this.isInChat())) {
        if (isCtrlLeft && (this.isInChat() || ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))) {
          return;
        }
        if (isKeyU && (this.isInChat() || ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        this.clickGUI.toggle();
        return;
      }

      // Close ClickGUI on Escape without popping up any game menu
      if (e.key === 'Escape') {
        if (this.clickGUI && this.clickGUI.isOpen) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.clickGUI.close();
          return;
        }
      }

      // 2. Module Keybinds
      if (this.isInChat() || ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      this.modules.forEach(mod => {
        if (mod.keybind) {
          const isMatch = (e.code === mod.keybind || e.key === mod.keybind) ||
                          (mod.keybind === 'ShiftRight' && this.isRightShiftKey(e));
          if (isMatch) {
            this.toggleModule(mod);
          }
        }
      });
    });
  }

  isInChat() {
    const chat = document.getElementById('game-chat-box');
    return chat && chat.style.display === 'flex';
  }

  onTick(gameContext) {
    this.modules.forEach(m => {
      if (m.enabled) {
        m.onTick(gameContext);
      }
    });
    this.hud.onTick(gameContext);
  }

  applyPreset(presetName) {
    this.modules.forEach(m => {
      if (m.category !== 'Client') m.setEnabled(false);
    });

    if (presetName === 'anarchy') {
      this.getModule('KillAura').setEnabled(true);
      this.getModule('Aimbot').setEnabled(true);
      this.getModule('Wallhack').setEnabled(true);
      this.getModule('Fly').setEnabled(true);
      this.getModule('Speed').setEnabled(true);
      this.getModule('Scaffold').setEnabled(true);
      this.getModule('ESP3D').setEnabled(true);
      this.getModule('Tracers').setEnabled(true);
      this.getModule('NoFall').setEnabled(true);
      this.getModule('AutoWater').setEnabled(true);
      this.getModule('XRay').setEnabled(true);
      this.notifications.show('Preset Loaded', 'Applied Wurst Anarchy Configuration', 'success');
    } else if (presetName === 'legit') {
      this.getModule('Aimbot').setEnabled(true);
      this.getModule('Wallhack').setEnabled(true);
      this.getModule('Velocity').setEnabled(true);
      this.getModule('Reach').setEnabled(true);
      this.getModule('TriggerBot').setEnabled(true);
      this.getModule('AutoArmor').setEnabled(true);
      this.getModule('ESP3D').setEnabled(true);
      this.notifications.show('Preset Loaded', 'Applied Wurst Legit PvP Configuration', 'success');
    }

    this.hud.updateArrayList();
    if (this.tabGUI) this.tabGUI.render();
    if (this.clickGUI) this.clickGUI.rebuildPanels();
    this.saveConfig();
  }

  loadConfig() {
    const saved = localStorage.getItem('spritehack_config');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        data.forEach(item => {
          const mod = this.getModule(item.name);
          if (mod) {
            mod.setEnabled(item.enabled);
            if (item.keybind !== undefined) mod.keybind = item.keybind;
            if (item.settings && Array.isArray(item.settings)) {
              item.settings.forEach(sData => {
                const setting = mod.settings.find(s => s.name === sData.name);
                if (setting) setting.setValue(sData.value);
              });
            }
          }
        });
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  saveConfig() {
    const data = this.modules.map(m => ({
      name: m.name,
      enabled: m.enabled,
      keybind: m.keybind,
      settings: m.settings.map(s => ({ name: s.name, value: s.value }))
    }));
    localStorage.setItem('spritehack_config', JSON.stringify(data));
  }
}

  window.SpriteHack = SpriteHack;
})(window);
