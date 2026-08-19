import * as THREE from 'three';

export class EntityManager {
  constructor(scene, audio) {
    this.scene = scene;
    this.audio = audio;
    this.entities = [];
    this.spawnInitialMobs();
  }

  spawnInitialMobs() {
    const mobTypes = [
      { name: 'Zombie_Apex', type: 'zombie', x: 4, z: 4, hp: 20 },
      { name: '2B2T_Anarchist', type: 'player', x: -6, z: 6, hp: 20 },
      { name: 'CrystalPvPer', type: 'player', x: 8, z: -5, hp: 20 },
      { name: 'Skeleton_Archer', type: 'skeleton', x: -5, z: -8, hp: 20 },
      { name: 'Minemen_Champ', type: 'player', x: 6, z: 8, hp: 20 }
    ];

    mobTypes.forEach(m => this.spawnEntity(m.name, m.type, m.x, 18, m.z, m.hp));
  }

  createHumanoidMesh(type = 'zombie') {
    const group = new THREE.Group();

    let skinColor = 0x5a8a4e; // Zombie green
    let shirtColor = 0x2e8b9e;
    let pantsColor = 0x2b387c;

    if (type === 'player') {
      skinColor = 0xcfa37a;
      shirtColor = 0x7928ca;
      pantsColor = 0x11131c;
    } else if (type === 'skeleton') {
      skinColor = 0xc8c8c8;
      shirtColor = 0x909090;
      pantsColor = 0x606060;
    }

    const skinMat = new THREE.MeshLambertMaterial({ color: skinColor });
    const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });

    // Head (0.5 x 0.5 x 0.5)
    const headGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 1.6;
    head.castShadow = true;
    group.add(head);

    // Body (0.5 x 0.75 x 0.25)
    const bodyGeom = new THREE.BoxGeometry(0.5, 0.75, 0.25);
    const body = new THREE.Mesh(bodyGeom, shirtMat);
    body.position.y = 0.98;
    body.castShadow = true;
    group.add(body);

    // Left Arm
    const armGeom = new THREE.BoxGeometry(0.2, 0.7, 0.2);
    const leftArm = new THREE.Mesh(armGeom, skinMat);
    leftArm.position.set(-0.35, 0.95, 0);
    group.add(leftArm);

    // Right Arm
    const rightArm = new THREE.Mesh(armGeom, skinMat);
    rightArm.position.set(0.35, 0.95, 0);
    group.add(rightArm);

    // Left Leg
    const legGeom = new THREE.BoxGeometry(0.22, 0.75, 0.22);
    const leftLeg = new THREE.Mesh(legGeom, pantsMat);
    leftLeg.position.set(-0.13, 0.38, 0);
    group.add(leftLeg);

    // Right Leg
    const rightLeg = new THREE.Mesh(legGeom, pantsMat);
    rightLeg.position.set(0.13, 0.38, 0);
    group.add(rightLeg);

    return { group, head, body, leftArm, rightArm, leftLeg, rightLeg, materials: [skinMat, shirtMat, pantsMat] };
  }

  spawnEntity(name, type, x, y, z, hp = 20) {
    const meshData = this.createHumanoidMesh(type);
    meshData.group.position.set(x, y, z);
    this.scene.add(meshData.group);

    const entity = {
      id: 'ent_' + Math.random().toString(36).substr(2, 9),
      name: name,
      type: type,
      health: hp,
      maxHealth: hp,
      position: meshData.group.position,
      velocity: new THREE.Vector3(0, 0, 0),
      meshData: meshData,
      hurtTime: 0,
      animTime: Math.random() * 10,
      isDead: false
    };

    this.entities.push(entity);
    return entity;
  }

  damageEntity(entity, amount = 7.0, knockbackDir = null) {
    if (entity.isDead) return;
    entity.health -= amount;
    entity.hurtTime = 0.25; // Hurt flash timer

    // Hurt sound & knockback
    this.audio.playHitHurt();

    if (knockbackDir) {
      entity.velocity.x += knockbackDir.x * 0.25;
      entity.velocity.y += 0.15;
      entity.velocity.z += knockbackDir.z * 0.25;
    }

    // Flash Red
    entity.meshData.materials.forEach(m => {
      m.emissive.setHex(0xff0033);
    });

    if (entity.health <= 0) {
      entity.health = 0;
      entity.isDead = true;
      this.scene.remove(entity.meshData.group);
      // Respawn after 3 seconds
      setTimeout(() => {
        if (entity.isDead) {
          entity.health = entity.maxHealth;
          entity.isDead = false;
          entity.position.set((Math.random() - 0.5) * 16, 18, (Math.random() - 0.5) * 16);
          this.scene.add(entity.meshData.group);
        }
      }, 3000);
    }
  }

  update(deltaTime, playerPosition, voxelWorld) {
    this.entities.forEach(ent => {
      if (ent.isDead) return;

      ent.animTime += deltaTime * 6;

      // Handle Hurt Flash Restore
      if (ent.hurtTime > 0) {
        ent.hurtTime -= deltaTime;
        if (ent.hurtTime <= 0) {
          ent.meshData.materials.forEach(m => m.emissive.setHex(0x000000));
        }
      }

      // Simple AI wandering / Looking at player
      const dx = playerPosition.x - ent.position.x;
      const dz = playerPosition.z - ent.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 12 && dist > 1.2) {
        // Walk towards player slowly
        ent.position.x += (dx / dist) * 0.03;
        ent.position.z += (dz / dist) * 0.03;
        ent.meshData.group.rotation.y = Math.atan2(dx, dz);
      }

      // Apply Gravity
      ent.velocity.y -= 0.012;
      ent.position.add(ent.velocity);

      // Ground check
      const groundY = Math.floor(ent.position.y);
      if (voxelWorld.getBlock(ent.position.x, groundY, ent.position.z) !== 0) {
        ent.position.y = groundY + 1.0;
        ent.velocity.y = 0;
      }

      // Limb swing animation
      const swing = Math.sin(ent.animTime) * 0.6;
      ent.meshData.leftArm.rotation.x = -swing;
      ent.meshData.rightArm.rotation.x = swing;
      ent.meshData.leftLeg.rotation.x = swing;
      ent.meshData.rightLeg.rotation.x = -swing;
    });
  }
}
