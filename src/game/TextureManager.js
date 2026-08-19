// Procedural 16x16 Pixel Texture Generator for Minecraft Blocks
export class TextureManager {
  constructor() {
    this.textures = {};
    this.materials = {};
    this.initTextures();
  }

  createCanvas(width = 16, height = 16) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  initTextures() {
    // 1. Dirt Texture
    const dirt = this.createCanvas();
    const dirtCtx = dirt.ctx;
    dirtCtx.fillStyle = '#866043';
    dirtCtx.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if (Math.random() < 0.3) {
          dirtCtx.fillStyle = Math.random() < 0.5 ? '#573d26' : '#9c724c';
          dirtCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.dirt = dirt.canvas;

    // 2. Grass Top Texture
    const grassTop = this.createCanvas();
    const gtCtx = grassTop.ctx;
    gtCtx.fillStyle = '#5c8e32';
    gtCtx.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if (Math.random() < 0.35) {
          gtCtx.fillStyle = Math.random() < 0.5 ? '#4b7528' : '#6fad3d';
          gtCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.grassTop = grassTop.canvas;

    // 3. Grass Side Texture
    const grassSide = this.createCanvas();
    const gsCtx = grassSide.ctx;
    gsCtx.drawImage(dirt.canvas, 0, 0);
    gsCtx.fillStyle = '#5c8e32';
    for (let x = 0; x < 16; x++) {
      const drop = Math.floor(Math.sin(x * 1.5) * 2) + 3;
      gsCtx.fillRect(x, 0, 1, drop);
      if (Math.random() < 0.4) gsCtx.fillRect(x, drop, 1, 1);
    }
    this.textures.grassSide = grassSide.canvas;

    // 4. Stone Texture
    const stone = this.createCanvas();
    const stoneCtx = stone.ctx;
    stoneCtx.fillStyle = '#737373';
    stoneCtx.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if (Math.random() < 0.3) {
          stoneCtx.fillStyle = Math.random() < 0.5 ? '#595959' : '#8c8c8c';
          stoneCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.stone = stone.canvas;

    // 5. Cobblestone
    const cobble = this.createCanvas();
    const cCtx = cobble.ctx;
    cCtx.fillStyle = '#616161';
    cCtx.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x += 4) {
      for (let y = 0; y < 16; y += 4) {
        cCtx.fillStyle = Math.random() < 0.5 ? '#7a7a7a' : '#454545';
        cCtx.fillRect(x, y, 3, 3);
      }
    }
    this.textures.cobblestone = cobble.canvas;

    // 6. Oak Log Side
    const log = this.createCanvas();
    const logCtx = log.ctx;
    logCtx.fillStyle = '#675231';
    logCtx.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y++) {
      logCtx.fillStyle = y % 4 === 0 ? '#45351e' : '#7d643c';
      logCtx.fillRect(0, y, 16, 1);
    }
    this.textures.log = log.canvas;

    // 7. Oak Leaves
    const leaves = this.createCanvas();
    const lCtx = leaves.ctx;
    lCtx.fillStyle = '#38631d';
    lCtx.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if ((x + y) % 2 === 0) {
          lCtx.fillStyle = Math.random() < 0.5 ? '#2c4d16' : '#498026';
          lCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.leaves = leaves.canvas;

    // 8. Diamond Ore
    const diamondOre = this.createCanvas();
    const dCtx = diamondOre.ctx;
    dCtx.drawImage(stone.canvas, 0, 0);
    dCtx.fillStyle = '#2cf2e0';
    [[3,3], [4,3], [3,4], [10,6], [11,6], [11,7], [6,11], [7,11], [6,12]].forEach(([x, y]) => {
      dCtx.fillRect(x, y, 1, 1);
    });
    this.textures.diamondOre = diamondOre.canvas;

    // 9. Iron Ore
    const ironOre = this.createCanvas();
    const iCtx = ironOre.ctx;
    iCtx.drawImage(stone.canvas, 0, 0);
    iCtx.fillStyle = '#d8af93';
    [[4,4], [5,4], [10,8], [11,8], [7,12], [8,12]].forEach(([x, y]) => {
      iCtx.fillRect(x, y, 1, 1);
    });
    this.textures.ironOre = ironOre.canvas;

    // 10. Coal Ore
    const coalOre = this.createCanvas();
    const clCtx = coalOre.ctx;
    clCtx.drawImage(stone.canvas, 0, 0);
    clCtx.fillStyle = '#212121';
    [[3,3], [4,4], [10,7], [11,8], [5,11], [6,12]].forEach(([x, y]) => {
      clCtx.fillRect(x, y, 1, 1);
    });
    this.textures.coalOre = coalOre.canvas;

    // 11. Bedrock
    const bedrock = this.createCanvas();
    const bCtx = bedrock.ctx;
    bCtx.fillStyle = '#1c1c1c';
    bCtx.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if (Math.random() < 0.4) {
          bCtx.fillStyle = Math.random() < 0.5 ? '#363636' : '#080808';
          bCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.bedrock = bedrock.canvas;

    // 12. Water (Animated-ready)
    const water = this.createCanvas();
    const wCtx = water.ctx;
    wCtx.fillStyle = '#1e5fcc';
    wCtx.fillRect(0, 0, 16, 16);
    wCtx.fillStyle = '#2b72e8';
    for (let y = 0; y < 16; y += 3) {
      wCtx.fillRect(0, y, 16, 1);
    }
    this.textures.water = water.canvas;

    // 13. TNT
    const tnt = this.createCanvas();
    const tCtx = tnt.ctx;
    tCtx.fillStyle = '#db3223';
    tCtx.fillRect(0, 0, 16, 16);
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(0, 6, 16, 4);
    tCtx.fillStyle = '#000000';
    tCtx.font = 'bold 3px sans-serif';
    tCtx.fillText('TNT', 4, 9);
    this.textures.tnt = tnt.canvas;

    // 14. Diamond Block
    const dBlock = this.createCanvas();
    const dbCtx = dBlock.ctx;
    dbCtx.fillStyle = '#4df0e0';
    dbCtx.fillRect(0, 0, 16, 16);
    dbCtx.strokeStyle = '#2ab5a7';
    dbCtx.strokeRect(0.5, 0.5, 15, 15);
    this.textures.diamondBlock = dBlock.canvas;

    // 15. Bricks
    const brick = this.createCanvas();
    const brCtx = brick.ctx;
    brCtx.fillStyle = '#9b4a3a';
    brCtx.fillRect(0, 0, 16, 16);
    brCtx.fillStyle = '#d0d0d0';
    brCtx.fillRect(0, 4, 16, 1);
    brCtx.fillRect(0, 9, 16, 1);
    brCtx.fillRect(0, 14, 16, 1);
    this.textures.brick = brick.canvas;

    // 16. Obsidian
    const obs = this.createCanvas();
    const oCtx = obs.ctx;
    oCtx.fillStyle = '#140c21';
    oCtx.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if (Math.random() < 0.25) {
          oCtx.fillStyle = Math.random() < 0.5 ? '#261542' : '#3e246a';
          oCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.textures.obsidian = obs.canvas;
  }

  getTexture(name) {
    return this.textures[name] || this.textures.stone;
  }
}
