import * as THREE from 'three';
import { BLOCK_TYPES } from './VoxelWorld.js';

export class Player {
  constructor(scene, camera, voxelWorld, audioEngine) {
    this.scene = scene;
    this.camera = camera;
    this.world = voxelWorld;
    this.audio = audioEngine;

    // Position & Physics
    this.position = new THREE.Vector3(0, 16, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.yaw = 0;
    this.pitch = 0;
    this.onGround = false;
    this.isFlying = false;
    this.isNoClip = false;
    this.speedMultiplier = 1.0;
    this.stepHeight = 0.6;
    this.jumpVelocity = 0.22;
    this.gravity = 0.012;

    // Camera Perspective (Freelook) & Freecam State
    this.isPerspectiveActive = false;
    this.perspectiveMode = 'FirstPerson'; // 'FirstPerson', 'ThirdPersonBack', 'ThirdPersonFront'
    this.perspectiveYaw = 0;
    this.perspectivePitch = 0;
    this.thirdPersonDistance = 3.5;

    this.isFreecamActive = false;
    this.freecamPos = new THREE.Vector3(0, 17.62, 0);
    this.freecamYaw = 0;
    this.freecamPitch = 0;

    // Stats & Inventory
    this.health = 20.0;
    this.maxHealth = 20.0;
    this.hunger = 20;
    this.selectedSlot = 0;
    this.inventory = [
      { type: BLOCK_TYPES.DIAMOND_BLOCK, count: 64, name: 'Diamond Block' },
      { type: BLOCK_TYPES.TNT, count: 64, name: 'TNT Block' },
      { type: BLOCK_TYPES.LOG, count: 64, name: 'Oak Wood' },
      { type: BLOCK_TYPES.GRASS, count: 64, name: 'Grass Block' },
      { type: BLOCK_TYPES.OBSIDIAN, count: 64, name: 'Obsidian' },
      { type: BLOCK_TYPES.BRICK, count: 64, name: 'Bricks' },
      { type: BLOCK_TYPES.STONE, count: 64, name: 'Stone' },
      { type: BLOCK_TYPES.COBBLE, count: 64, name: 'Cobblestone' },
      { type: 'SWORD', count: 1, name: 'Diamond Sword' }
    ];

    // Controls
    this.keys = {};
    this.isPointerLocked = false;
    this.reachDistance = 4.5;
    this.fastPlace = false;
    this.fastBreak = false;
    this.noFall = false;

    // Hand & 3D Character Viewmodel
    this.handModel = null;
    this.playerBodyMesh = null;
    this.isSwinging = false;
    this.swingProgress = 0;

    this.initHandModel();
    this.initPlayerBodyMesh();
    this.initInputListeners();
  }

  initHandModel() {
    const handGroup = new THREE.Group();

    // Arm
    const armGeom = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const armMat = new THREE.MeshLambertMaterial({ color: 0x9c724c });
    const arm = new THREE.Mesh(armGeom, armMat);
    arm.position.set(0.35, -0.3, -0.6);
    arm.rotation.set(0.3, -0.2, 0.1);
    handGroup.add(arm);

    // Sword in hand
    const bladeGeom = new THREE.BoxGeometry(0.06, 0.5, 0.03);
    const bladeMat = new THREE.MeshLambertMaterial({ color: 0x2cf2e0, emissive: 0x0a3d38 });
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    blade.position.set(0.35, -0.1, -0.8);
    blade.rotation.set(0.8, -0.3, 0.2);
    handGroup.add(blade);

    this.camera.add(handGroup);
    this.handModel = handGroup;
  }

  initPlayerBodyMesh() {
    const group = new THREE.Group();

    const skinMat = new THREE.MeshLambertMaterial({ color: 0xcfa37a });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x7928ca });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x11131c });

    // Head
    const headGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 1.6;
    head.castShadow = true;
    group.add(head);

    // Body
    const bodyGeom = new THREE.BoxGeometry(0.5, 0.75, 0.25);
    const body = new THREE.Mesh(bodyGeom, shirtMat);
    body.position.y = 0.98;
    body.castShadow = true;
    group.add(body);

    // Arms
    const limbGeom = new THREE.BoxGeometry(0.22, 0.7, 0.22);
    const leftArm = new THREE.Mesh(limbGeom, skinMat);
    leftArm.position.set(-0.36, 0.95, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(limbGeom, skinMat);
    rightArm.position.set(0.36, 0.95, 0);
    group.add(rightArm);

    // Legs
    const leftLeg = new THREE.Mesh(limbGeom, pantsMat);
    leftLeg.position.set(-0.13, 0.38, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(limbGeom, pantsMat);
    rightLeg.position.set(0.13, 0.38, 0);
    group.add(rightLeg);

    this.playerBodyMesh = group;
    this.scene.add(this.playerBodyMesh);
    this.playerBodyMesh.visible = false;
  }

  initInputListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.key >= '1' && e.key <= '9') {
        this.selectedSlot = parseInt(e.key) - 1;
        this.updateHotbarUI();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse Look (Freecam, Freelook Perspective, or Standard Yaw/Pitch)
    window.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked) return;
      const sens = 0.0022;
      if (this.isFreecamActive) {
        this.freecamYaw -= e.movementX * sens;
        this.freecamPitch -= e.movementY * sens;
        this.freecamPitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.freecamPitch));
      } else if (this.isPerspectiveActive) {
        this.perspectiveYaw -= e.movementX * sens;
        this.perspectivePitch -= e.movementY * sens;
        this.perspectivePitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.perspectivePitch));
      } else {
        this.yaw -= e.movementX * sens;
        this.pitch -= e.movementY * sens;
        this.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.pitch));
      }
    });

    // Mouse clicks (Break / Place)
    window.addEventListener('mousedown', (e) => {
      if (!this.isPointerLocked) return;
      this.swingHand();
      if (e.button === 0) {
        this.breakTargetBlock();
      } else if (e.button === 2) {
        this.placeTargetBlock();
      }
    });
  }

  swingHand() {
    this.isSwinging = true;
    this.swingProgress = 0;
  }

  update(deltaTime) {
    // If Freecam is active, player's physical body does NOT move with WASD
    if (!this.isFreecamActive) {
      // 1. Calculate Movement Vector (relative to player.yaw)
      const moveDir = new THREE.Vector3(0, 0, 0);
      const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

      if (this.keys['KeyW']) moveDir.add(forward);
      if (this.keys['KeyS']) moveDir.sub(forward);
      if (this.keys['KeyD']) moveDir.add(right);
      if (this.keys['KeyA']) moveDir.sub(right);

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        const sprintBoost = (this.keys['ControlLeft'] || this.keys['ShiftLeft']) ? 1.4 : 1.0;
        const speed = 0.12 * this.speedMultiplier * sprintBoost;

        this.velocity.x = moveDir.x * speed;
        this.velocity.z = moveDir.z * speed;
      } else {
        this.velocity.x *= 0.6;
        this.velocity.z *= 0.6;
      }

      // 2. Vertical Movement & Gravity
      if (this.isFlying) {
        this.velocity.y = 0;
        if (this.keys['Space']) this.velocity.y = 0.18 * this.speedMultiplier;
        if (this.keys['ShiftLeft'] || this.keys['KeyC']) this.velocity.y = -0.18 * this.speedMultiplier;
      } else {
        if (this.keys['Space'] && this.onGround) {
          this.velocity.y = this.jumpVelocity;
          this.audio.playStep();
        }
        this.velocity.y -= this.gravity;
      }

      // 3. Collision Detection & Application
      if (this.isNoClip) {
        this.position.add(this.velocity);
      } else {
        this.applyCollisions();
      }
    } else {
      // Freeze physical body velocity during Freecam
      this.velocity.set(0, 0, 0);
    }

    // Update 3D player body avatar mesh
    if (this.playerBodyMesh) {
      this.playerBodyMesh.position.copy(this.position);
      this.playerBodyMesh.rotation.y = this.yaw;
      this.playerBodyMesh.visible = (this.isFreecamActive || this.isPerspectiveActive || this.perspectiveMode !== 'FirstPerson');
    }

    if (this.handModel) {
      this.handModel.visible = (!this.isFreecamActive && !this.isPerspectiveActive && this.perspectiveMode === 'FirstPerson');
    }

    // 4. Update Camera Perspective & Freecam View
    if (this.isFreecamActive) {
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.x = this.freecamPitch;
      euler.y = this.freecamYaw;
      this.camera.position.copy(this.freecamPos);
      this.camera.quaternion.setFromEuler(euler);
    } else if (this.isPerspectiveActive) {
      const dist = this.thirdPersonDistance || 3.5;
      const eyePos = new THREE.Vector3(this.position.x, this.position.y + 1.62, this.position.z);
      const pYaw = this.perspectiveYaw;
      const pPitch = this.perspectivePitch;

      if (this.perspectiveMode === 'ThirdPersonFront') {
        const frontDir = new THREE.Vector3(
          -Math.sin(pYaw) * Math.cos(pPitch),
          Math.sin(pPitch),
          -Math.cos(pYaw) * Math.cos(pPitch)
        ).normalize();
        const camPos = eyePos.clone().add(frontDir.multiplyScalar(dist));
        this.camera.position.copy(camPos);
        this.camera.lookAt(eyePos);
      } else {
        // ThirdPersonBack Freelook Orbit
        const backDir = new THREE.Vector3(
          Math.sin(pYaw) * Math.cos(pPitch),
          -Math.sin(pPitch),
          Math.cos(pYaw) * Math.cos(pPitch)
        ).normalize();
        const camPos = eyePos.clone().add(backDir.multiplyScalar(dist));
        this.camera.position.copy(camPos);
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = pPitch;
        euler.y = pYaw;
        this.camera.quaternion.setFromEuler(euler);
      }
    } else {
      // Standard First Person
      this.camera.position.set(this.position.x, this.position.y + 1.62, this.position.z);
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.x = this.pitch;
      euler.y = this.yaw;
      this.camera.quaternion.setFromEuler(euler);
    }

    // 5. Hand Swing Animation
    if (this.isSwinging && this.handModel) {
      this.swingProgress += 0.15;
      const swingAngle = Math.sin(this.swingProgress * Math.PI) * 0.5;
      this.handModel.position.z = -0.6 + swingAngle * 0.2;
      this.handModel.rotation.x = swingAngle;
      if (this.swingProgress >= 1.0) {
        this.isSwinging = false;
        this.handModel.position.z = -0.6;
        this.handModel.rotation.x = 0;
      }
    }
  }

  applyCollisions() {
    const p = this.position;
    const v = this.velocity;
    const radius = 0.3;
    const height = 1.8;

    p.y += v.y;
    const minBlockY = Math.floor(p.y);
    const maxBlockY = Math.floor(p.y + height);

    if (v.y < 0) {
      const blockBelow = this.world.getBlock(p.x, minBlockY, p.z);
      if (blockBelow !== BLOCK_TYPES.AIR) {
        p.y = minBlockY + 1.0;
        v.y = 0;
        this.onGround = true;
      } else {
        this.onGround = false;
      }
    } else if (v.y > 0) {
      const blockAbove = this.world.getBlock(p.x, maxBlockY, p.z);
      if (blockAbove !== BLOCK_TYPES.AIR) {
        p.y = maxBlockY - height;
        v.y = 0;
      }
    }

    p.x += v.x;
    if (this.isCollidingWithWorld(p.x, p.y, p.z, radius, height)) {
      if (this.onGround && !this.isCollidingWithWorld(p.x, p.y + this.stepHeight, p.z, radius, height)) {
        p.y += this.stepHeight;
      } else {
        p.x -= v.x;
        v.x = 0;
      }
    }

    p.z += v.z;
    if (this.isCollidingWithWorld(p.x, p.y, p.z, radius, height)) {
      if (this.onGround && !this.isCollidingWithWorld(p.x, p.y + this.stepHeight, p.z, radius, height)) {
        p.y += this.stepHeight;
      } else {
        p.z -= v.z;
        v.z = 0;
      }
    }
  }

  isCollidingWithWorld(x, y, z, radius, height) {
    const minX = Math.floor(x - radius);
    const maxX = Math.floor(x + radius);
    const minY = Math.floor(y);
    const maxY = Math.floor(y + height - 0.1);
    const minZ = Math.floor(z - radius);
    const maxZ = Math.floor(z + radius);

    for (let bx = minX; bx <= maxX; bx++) {
      for (let by = minY; by <= maxY; by++) {
        for (let bz = minZ; bz <= maxZ; bz++) {
          if (this.world.getBlock(bx, by, bz) !== BLOCK_TYPES.AIR) {
            return true;
          }
        }
      }
    }
    return false;
  }

  raycastBlock() {
    const rayOrigin = new THREE.Vector3(this.position.x, this.position.y + 1.62, this.position.z);
    const rayDir = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();

    const maxDist = this.reachDistance;
    const step = 0.05;
    let prevPos = rayOrigin.clone();

    for (let d = 0; d < maxDist; d += step) {
      const checkPos = rayOrigin.clone().add(rayDir.clone().multiplyScalar(d));
      const bx = Math.floor(checkPos.x);
      const by = Math.floor(checkPos.y);
      const bz = Math.floor(checkPos.z);

      const block = this.world.getBlock(bx, by, bz);
      if (block !== BLOCK_TYPES.AIR) {
        return {
          target: { x: bx, y: by, z: bz, block },
          adjacent: { x: Math.floor(prevPos.x), y: Math.floor(prevPos.y), z: Math.floor(prevPos.z) }
        };
      }
      prevPos = checkPos.clone();
    }
    return null;
  }

  breakTargetBlock() {
    const hit = this.raycastBlock();
    if (hit) {
      const removed = this.world.breakBlock(hit.target.x, hit.target.y, hit.target.z);
      if (removed) {
        this.audio.playBlockBreak();
      }
    }
  }

  placeTargetBlock() {
    const hit = this.raycastBlock();
    if (hit) {
      const item = this.inventory[this.selectedSlot];
      if (item && item.type !== 'SWORD') {
        const placed = this.world.placeBlock(hit.adjacent.x, hit.adjacent.y, hit.adjacent.z, item.type);
        if (placed) {
          this.audio.playBlockPlace();
        }
      }
    }
  }

  updateHotbarUI() {
    const hotbarEl = document.getElementById('hud-hotbar');
    if (!hotbarEl) return;
    const slots = hotbarEl.querySelectorAll('.hotbar-slot');
    slots.forEach((s, idx) => {
      if (idx === this.selectedSlot) s.classList.add('active');
      else s.classList.remove('active');
    });
  }
}
