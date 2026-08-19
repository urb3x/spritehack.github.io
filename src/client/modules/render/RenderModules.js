import { Module, CATEGORY } from '../Module.js';
import { NumberSetting, BooleanSetting, ColorSetting, ModeSetting } from '../Setting.js';
import * as THREE from 'three';

// Dedicated Wallhack & Chams Module
export class Wallhack extends Module {
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

export class ESP3D extends Module {
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

export class Tracers extends Module {
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

export class Fullbright extends Module {
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

export class XRay extends Module {
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

export class Trajectories extends Module {
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

export class Freecam extends Module {
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

export class Perspective extends Module {
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

export class BlockESP extends Module {
  constructor() {
    super('BlockESP', CATEGORY.RENDER, 'X-Ray highlights diamond ores, iron, and chests through stone layers.', 'KeyX');
  }
}

export class Breadcrumbs extends Module {
  constructor() {
    super('Breadcrumbs', CATEGORY.RENDER, 'Leaves an animated neon particle path along your movement trajectory.');
  }
}

export class Nametags extends Module {
  constructor() {
    super('Nametags', CATEGORY.RENDER, 'Renders scaled health, distance, and player names over entities.');
  }
}

export class TargetHUD extends Module {
  constructor() {
    super('TargetHUD', CATEGORY.RENDER, 'Displays an elegant popup widget with current target avatar, health, and distance.');
  }
}
