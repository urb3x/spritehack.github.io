import * as THREE from 'three';

export const BLOCK_TYPES = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  COBBLE: 4,
  LOG: 5,
  LEAVES: 6,
  DIAMOND_ORE: 7,
  IRON_ORE: 8,
  COAL_ORE: 9,
  BEDROCK: 10,
  TNT: 11,
  DIAMOND_BLOCK: 12,
  BRICK: 13,
  OBSIDIAN: 14,
  WATER: 15
};

export class VoxelWorld {
  constructor(scene, textureManager) {
    this.scene = scene;
    this.textureManager = textureManager;
    this.blocks = new Map(); // key: "x,y,z", value: blockId
    this.worldSize = 36; // -18 to +18
    this.worldHeight = 24;
    this.materials = {};
    this.instancedMeshes = {};
    this.initMaterials();
    this.generateWorld();
    this.buildMeshes();
  }

  key(x, y, z) {
    return `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
  }

  initMaterials() {
    const createTex = (canvas) => {
      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      return tex;
    };

    const tm = this.textureManager;
    const grassTopMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.grassTop) });
    const grassSideMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.grassSide) });
    const dirtMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.dirt) });
    const stoneMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.stone) });
    const cobbleMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.cobblestone) });
    const logMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.log) });
    const leavesMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.leaves), transparent: true, alphaTest: 0.2 });
    const dOreMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.diamondOre) });
    const iOreMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.ironOre) });
    const cOreMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.coalOre) });
    const bedrockMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.bedrock) });
    const tntMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.tnt) });
    const dBlockMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.diamondBlock) });
    const brickMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.brick) });
    const obsMat = new THREE.MeshLambertMaterial({ map: createTex(tm.textures.obsidian) });
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x3388ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });

    // Grass multi-material: [right, left, top, bottom, front, back]
    this.materials[BLOCK_TYPES.GRASS] = [grassSideMat, grassSideMat, grassTopMat, dirtMat, grassSideMat, grassSideMat];
    this.materials[BLOCK_TYPES.DIRT] = dirtMat;
    this.materials[BLOCK_TYPES.STONE] = stoneMat;
    this.materials[BLOCK_TYPES.COBBLE] = cobbleMat;
    this.materials[BLOCK_TYPES.LOG] = logMat;
    this.materials[BLOCK_TYPES.LEAVES] = leavesMat;
    this.materials[BLOCK_TYPES.DIAMOND_ORE] = dOreMat;
    this.materials[BLOCK_TYPES.IRON_ORE] = iOreMat;
    this.materials[BLOCK_TYPES.COAL_ORE] = cOreMat;
    this.materials[BLOCK_TYPES.BEDROCK] = bedrockMat;
    this.materials[BLOCK_TYPES.TNT] = tntMat;
    this.materials[BLOCK_TYPES.DIAMOND_BLOCK] = dBlockMat;
    this.materials[BLOCK_TYPES.BRICK] = brickMat;
    this.materials[BLOCK_TYPES.OBSIDIAN] = obsMat;
    this.materials[BLOCK_TYPES.WATER] = waterMat;
  }

  generateWorld() {
    const half = Math.floor(this.worldSize / 2);
    for (let x = -half; x < half; x++) {
      for (let z = -half; z < half; z++) {
        // Bedrock floor
        this.setBlock(x, 0, z, BLOCK_TYPES.BEDROCK);

        // Smooth elevation noise
        const height = Math.floor(
          Math.sin(x * 0.15) * 2.5 + 
          Math.cos(z * 0.15) * 2.5 + 
          Math.sin((x + z) * 0.1) * 2 + 
          8
        );

        for (let y = 1; y < height - 3; y++) {
          // Ores in deep layers
          if (y < 4 && Math.random() < 0.08) {
            this.setBlock(x, y, z, BLOCK_TYPES.DIAMOND_ORE);
          } else if (y < 7 && Math.random() < 0.12) {
            this.setBlock(x, y, z, BLOCK_TYPES.IRON_ORE);
          } else if (Math.random() < 0.1) {
            this.setBlock(x, y, z, BLOCK_TYPES.COAL_ORE);
          } else {
            this.setBlock(x, y, z, BLOCK_TYPES.STONE);
          }
        }

        // Subsurface dirt
        for (let y = Math.max(1, height - 3); y < height; y++) {
          this.setBlock(x, y, z, BLOCK_TYPES.DIRT);
        }

        // Top grass layer
        this.setBlock(x, height, z, BLOCK_TYPES.GRASS);

        // Trees
        if (x > -half + 3 && x < half - 3 && z > -half + 3 && z < half - 3) {
          if (Math.random() < 0.035) {
            this.generateTree(x, height + 1, z);
          }
        }
      }
    }
  }

  generateTree(x, baseY, z) {
    const trunkHeight = 4 + Math.floor(Math.random() * 2);
    for (let y = 0; y < trunkHeight; y++) {
      this.setBlock(x, baseY + y, z, BLOCK_TYPES.LOG);
    }

    const topY = baseY + trunkHeight;
    for (let lx = -2; lx <= 2; lx++) {
      for (let lz = -2; lz <= 2; lz++) {
        for (let ly = -1; ly <= 1; ly++) {
          if (Math.abs(lx) + Math.abs(lz) + Math.abs(ly) <= 3) {
            const targetY = topY + ly;
            if (!this.getBlock(x + lx, targetY, z + lz)) {
              this.setBlock(x + lx, targetY, z + lz, BLOCK_TYPES.LEAVES);
            }
          }
        }
      }
    }
  }

  setBlock(x, y, z, blockId) {
    const k = this.key(x, y, z);
    if (blockId === BLOCK_TYPES.AIR) {
      this.blocks.delete(k);
    } else {
      this.blocks.set(k, { type: blockId, x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) });
    }
  }

  getBlock(x, y, z) {
    const b = this.blocks.get(this.key(x, y, z));
    return b ? b.type : BLOCK_TYPES.AIR;
  }

  buildMeshes() {
    // Clean old meshes
    Object.values(this.instancedMeshes).forEach(m => {
      this.scene.remove(m);
      if (m.geometry) m.geometry.dispose();
    });
    this.instancedMeshes = {};

    // Group blocks by type
    const groups = {};
    for (const b of this.blocks.values()) {
      if (!groups[b.type]) groups[b.type] = [];
      groups[b.type].push(b);
    }

    const geom = new THREE.BoxGeometry(1, 1, 1);
    const dummy = new THREE.Object3D();

    for (const [typeId, blockList] of Object.entries(groups)) {
      const mat = this.materials[typeId];
      if (!mat) continue;

      const instMesh = new THREE.InstancedMesh(geom, mat, blockList.length);
      instMesh.castShadow = true;
      instMesh.receiveShadow = true;

      for (let i = 0; i < blockList.length; i++) {
        const b = blockList[i];
        dummy.position.set(b.x + 0.5, b.y + 0.5, b.z + 0.5);
        dummy.updateMatrix();
        instMesh.setMatrixAt(i, dummy.matrix);
      }
      instMesh.instanceMatrix.needsUpdate = true;
      this.scene.add(instMesh);
      this.instancedMeshes[typeId] = instMesh;
    }
  }

  rebuild() {
    this.buildMeshes();
  }

  breakBlock(x, y, z) {
    const b = this.getBlock(x, y, z);
    if (b && b !== BLOCK_TYPES.BEDROCK) {
      this.setBlock(x, y, z, BLOCK_TYPES.AIR);
      this.rebuild();
      return b;
    }
    return null;
  }

  placeBlock(x, y, z, blockId) {
    if (this.getBlock(x, y, z) === BLOCK_TYPES.AIR) {
      this.setBlock(x, y, z, blockId);
      this.rebuild();
      return true;
    }
    return false;
  }
}
