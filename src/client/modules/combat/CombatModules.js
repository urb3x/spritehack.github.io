import { Module, CATEGORY } from '../Module.js';
import { NumberSetting, BooleanSetting, ModeSetting } from '../Setting.js';
import * as THREE from 'three';

export class KillAura extends Module {
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
export class Aimbot extends Module {
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

export class Criticals extends Module {
  constructor() {
    super('Criticals', CATEGORY.COMBAT, 'Spoofs mini-jump motion packets to inflict 100% critical hit damage.', 'KeyC');
    this.packetMode = this.addSetting(new ModeSetting('Mode', 'PacketHop', ['PacketHop', 'MiniJump', 'MotionSpoof']));
  }
}

export class Velocity extends Module {
  constructor() {
    super('Velocity', CATEGORY.COMBAT, 'Reduces incoming entity knockback to zero or customizable percentage.', 'KeyV');
    this.horizontal = this.addSetting(new NumberSetting('Horizontal', 0, 0, 100, 5, 'Horizontal KB %'));
    this.vertical = this.addSetting(new NumberSetting('Vertical', 0, 0, 100, 5, 'Vertical KB %'));
  }
}

export class TriggerBot extends Module {
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

export class CrystalAura extends Module {
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

export class SpinBot extends Module {
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

export class AutoArmor extends Module {
  constructor() {
    super('AutoArmor', CATEGORY.COMBAT, 'Automatically equips the strongest diamond/netherite armor available.');
  }
}

export class Reach extends Module {
  constructor() {
    super('Reach', CATEGORY.COMBAT, 'Extends player combat and interaction reach up to 6.5 blocks.');
    this.reachVal = this.addSetting(new NumberSetting('Distance', 4.8, 3.0, 6.5, 0.1));
  }
  onTick({ player }) {
    if (this.enabled) player.reachDistance = this.reachVal.value;
    else player.reachDistance = 4.5;
  }
}
