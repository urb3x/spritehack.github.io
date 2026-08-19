import * as THREE from 'three';
import { AccountManager } from './launcher/AccountManager.js';
import { ServerManager } from './launcher/ServerManager.js';
import { VersionManager, SUPPORTED_VERSIONS } from './launcher/VersionManager.js';
import { DesktopLauncher } from './launcher/DesktopLauncher.js';
import { TextureManager } from './game/TextureManager.js';
import { AudioEngine } from './game/AudioEngine.js';
import { VoxelWorld, BLOCK_TYPES } from './game/VoxelWorld.js';
import { Player } from './game/Player.js';
import { EntityManager } from './game/EntityManager.js';
import { SpriteHack } from './client/SpriteHack.js';

class SpriteHackApp {
  constructor() {
    this.accountManager = new AccountManager();
    this.serverManager = new ServerManager();
    this.versionManager = new VersionManager();
    this.audioEngine = new AudioEngine();
    
    this.isInGame = false;
    this.currentServer = this.serverManager.servers[0];
    this.currentVersion = '1.20.4';
    
    // 3D Game variables
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.textureManager = null;
    this.voxelWorld = null;
    this.player = null;
    this.entityManager = null;
    this.spriteHack = null;
    this.ambientLight = null;

    this.initLauncherUI();
  }

  initLauncherUI() {
    // 1. Navigation Tabs
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        const targetTab = item.getAttribute('data-tab');
        document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
        const targetEl = document.getElementById(`tab-${targetTab}`);
        if (targetEl) targetEl.style.display = 'block';

        const titleEl = document.getElementById('header-tab-title');
        if (titleEl) {
          titleEl.textContent = item.querySelector('span:last-child').textContent;
        }
      });
    });

    // 2. Dual Version Selector (1.8.9 & 1.20.4)
    const card1204 = document.getElementById('card-ver-1204');
    const card189 = document.getElementById('card-ver-189');
    const selectVersion = document.getElementById('select-version');

    const updateVersionSelection = (ver) => {
      this.currentVersion = ver;
      this.versionManager.setVersion(ver);
      if (selectVersion) selectVersion.value = ver;

      if (ver === '1.20.4') {
        if (card1204) {
          card1204.classList.add('selected');
          card1204.style.borderColor = 'var(--accent-purple)';
          card1204.style.background = 'linear-gradient(135deg, rgba(157, 78, 221, 0.15), rgba(14, 17, 26, 0.9))';
        }
        if (card189) {
          card189.classList.remove('selected');
          card189.style.borderColor = 'var(--border-subtle)';
          card189.style.background = 'var(--bg-card)';
        }
      } else {
        if (card189) {
          card189.classList.add('selected');
          card189.style.borderColor = 'var(--accent-gold)';
          card189.style.background = 'linear-gradient(135deg, rgba(255, 190, 11, 0.15), rgba(14, 17, 26, 0.9))';
        }
        if (card1204) {
          card1204.classList.remove('selected');
          card1204.style.borderColor = 'var(--border-subtle)';
          card1204.style.background = 'var(--bg-card)';
        }
      }
    };

    if (card1204) card1204.addEventListener('click', () => updateVersionSelection('1.20.4'));
    if (card189) card189.addEventListener('click', () => updateVersionSelection('1.8.9'));
    if (selectVersion) selectVersion.addEventListener('change', (e) => updateVersionSelection(e.target.value));

    const quickAnarchyBtn = document.getElementById('btn-quick-anarchy');
    if (quickAnarchyBtn) {
      quickAnarchyBtn.addEventListener('click', () => {
        updateVersionSelection('1.20.4');
        this.currentServer = this.serverManager.servers[0];
        this.launchGame();
      });
    }

    const quickPvPBtn = document.getElementById('btn-quick-pvp');
    if (quickPvPBtn) {
      quickPvPBtn.addEventListener('click', () => {
        updateVersionSelection('1.8.9');
        this.currentServer = this.serverManager.servers[2];
        this.launchGame();
      });
    }

    // 3. Username & Skin setup
    const usernameInput = document.getElementById('input-username');
    const randomNameBtn = document.getElementById('btn-random-name');
    const sidebarAvatar = document.getElementById('sidebar-user-avatar');
    const sidebarName = document.getElementById('sidebar-user-name');
    const skinDisplay = document.getElementById('skin-3d-display');

    if (usernameInput) {
      usernameInput.value = this.accountManager.currentAccount.username;
      usernameInput.addEventListener('change', (e) => {
        const user = this.accountManager.setUsername(e.target.value);
        if (sidebarAvatar) sidebarAvatar.src = this.accountManager.currentAccount.avatarUrl;
        if (sidebarName) sidebarName.textContent = user;
        if (skinDisplay) skinDisplay.src = this.accountManager.currentAccount.bodyUrl;
      });
    }

    if (randomNameBtn) {
      randomNameBtn.addEventListener('click', () => {
        const rName = this.accountManager.getRandomUsername();
        if (usernameInput) usernameInput.value = rName;
        this.accountManager.setUsername(rName);
        if (sidebarAvatar) sidebarAvatar.src = this.accountManager.currentAccount.avatarUrl;
        if (sidebarName) sidebarName.textContent = rName;
        if (skinDisplay) skinDisplay.src = this.accountManager.currentAccount.bodyUrl;
      });
    }

    // Quick skin buttons
    document.querySelectorAll('.btn-quick-skin').forEach(b => {
      b.addEventListener('click', () => {
        const name = b.getAttribute('data-name');
        if (usernameInput) usernameInput.value = name;
        this.accountManager.setUsername(name);
        if (sidebarAvatar) sidebarAvatar.src = this.accountManager.currentAccount.avatarUrl;
        if (sidebarName) sidebarName.textContent = name;
        if (skinDisplay) skinDisplay.src = this.accountManager.currentAccount.bodyUrl;
      });
    });

    // 4. Render Server List
    this.renderServerList();

    // 5. Config preset buttons
    document.querySelectorAll('.btn-apply-config').forEach(btn => {
      btn.addEventListener('click', () => {
        const cfg = btn.getAttribute('data-config');
        if (this.spriteHack) {
          this.spriteHack.applyPreset(cfg);
        } else {
          localStorage.setItem('spritehack_active_preset', cfg);
          alert(`Preset "${cfg.toUpperCase()}" will load upon launch!`);
        }
      });
    });

    // 6. Launch 3D In-Browser Game
    const launchGameBtn = document.getElementById('btn-launch-game');
    if (launchGameBtn) {
      launchGameBtn.addEventListener('click', () => {
        this.launchGame();
      });
    }

    // 7. Desktop batch generator
    const downloadBatBtn = document.getElementById('btn-download-launcher-bat');
    if (downloadBatBtn) {
      downloadBatBtn.addEventListener('click', () => {
        const user = usernameInput ? usernameInput.value : 'SpriteHacker';
        DesktopLauncher.downloadLauncherBat(user, this.currentVersion, 6);
      });
    }

    // 8. Landing Page - Module Filtering Tabs
    const modTabs = document.querySelectorAll('.mod-tab-btn');
    const modCards = document.querySelectorAll('#modules-display-grid .module-card');
    if (modTabs.length > 0 && modCards.length > 0) {
      modTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          modTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          const category = tab.getAttribute('data-cat');
          modCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    }

    // 9. Web Demo Triggers
    const demoBtnHeader = document.getElementById('btn-header-demo');
    const demoBtnHero = document.getElementById('btn-hero-launch-demo');
    const scrollToDemo = () => {
      const demoSec = document.getElementById('web-demo');
      if (demoSec) demoSec.scrollIntoView({ behavior: 'smooth' });
    };
    if (demoBtnHeader) demoBtnHeader.addEventListener('click', scrollToDemo);
    if (demoBtnHero) demoBtnHero.addEventListener('click', scrollToDemo);
  }

  renderServerList() {
    const listEl = document.getElementById('server-list-container');
    if (!listEl) return;
    listEl.innerHTML = '';

    this.serverManager.servers.forEach(server => {
      const item = document.createElement('div');
      item.className = 'server-item';
      item.innerHTML = `
        <div class="server-icon">${server.icon}</div>
        <div class="server-info">
          <div class="server-top">
            <span class="server-name">${server.name}</span>
            <span class="server-type-badge ${server.badge}">${server.type}</span>
          </div>
          <div class="server-motd">${server.motd}</div>
        </div>
        <div class="server-stats">
          <div class="server-players">${server.players}</div>
          <div class="server-ping"><span>●</span> ${server.ping}ms</div>
        </div>
        <button class="server-join-btn">JOIN</button>
      `;

      item.querySelector('.server-join-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentServer = server;
        this.launchGame();
      });

      listEl.appendChild(item);
    });
  }

  launchGame() {
    this.isInGame = true;

    const launcherView = document.getElementById('launcher-view');
    const gameView = document.getElementById('game-view');

    if (launcherView) launcherView.style.display = 'none';
    if (gameView) gameView.classList.add('active');

    // Update HUD Version Badge
    const verBadge = document.getElementById('hud-ver-badge');
    if (verBadge) {
      verBadge.textContent = this.currentVersion;
      verBadge.style.color = this.currentVersion === '1.8.9' ? 'var(--accent-gold)' : 'var(--accent-purple)';
    }

    this.init3DEngine();
  }

  init3DEngine() {
    if (this.renderer) return;

    const canvas = document.getElementById('game-canvas');
    
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.018);

    this.camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);

    // 2. Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    sunLight.position.set(20, 40, 20);
    sunLight.castShadow = true;
    this.scene.add(sunLight);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // 4. Game Systems
    this.textureManager = new TextureManager();
    this.voxelWorld = new VoxelWorld(this.scene, this.textureManager);
    this.player = new Player(this.scene, this.camera, this.voxelWorld, this.audioEngine);
    this.entityManager = new EntityManager(this.scene, this.audioEngine);
    this.spriteHack = new SpriteHack(this.audioEngine);

    // Try loading previous session config first. Only apply default preset on fresh start!
    const hasSavedConfig = this.spriteHack.loadConfig();
    if (!hasSavedConfig) {
      if (this.currentVersion === '1.8.9') {
        this.spriteHack.applyPreset('legit');
      } else {
        this.spriteHack.applyPreset('anarchy');
      }
    }

    // 5. Hotbar Generation
    this.generateHotbarUI();

    // 6. Pointer Lock
    canvas.addEventListener('click', () => {
      if (!this.spriteHack.clickGUI.isOpen) {
        canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.player.isPointerLocked = (document.pointerLockElement === canvas);
    });

    // 7. GUI Top Toggle & Controls
    const topGuiBtn = document.getElementById('btn-toggle-gui-top');
    if (topGuiBtn) {
      topGuiBtn.addEventListener('click', () => {
        this.spriteHack.clickGUI.toggle();
      });
    }

    const spawnMobBtn = document.getElementById('btn-spawn-mob');
    if (spawnMobBtn) {
      spawnMobBtn.addEventListener('click', () => {
        const p = this.player.position;
        const spawned = this.entityManager.spawnEntity(
          'Target_' + Math.floor(Math.random() * 90 + 10),
          Math.random() < 0.5 ? 'zombie' : 'player',
          p.x + (Math.random() - 0.5) * 6,
          p.y + 2,
          p.z + (Math.random() - 0.5) * 6
        );
        this.spriteHack.notifications.show('Spawned Entity', `Spawned ${spawned.name} for KillAura testing!`, 'success');
      });
    }

    const exitBtn = document.getElementById('btn-exit-to-launcher');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        document.exitPointerLock();
        document.getElementById('game-view').classList.remove('active');
        document.getElementById('launcher-view').style.display = 'flex';
        this.isInGame = false;
      });
    }

    // 8. Chat Console
    this.initChatConsole();

    // 9. Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 10. Start Main Render Loop
    this.lastTime = performance.now();
    this.animate();
  }

  generateHotbarUI() {
    const hotbarEl = document.getElementById('hud-hotbar');
    if (!hotbarEl) return;
    hotbarEl.innerHTML = '';

    this.player.inventory.forEach((item, idx) => {
      const slot = document.createElement('div');
      slot.className = `hotbar-slot ${idx === this.player.selectedSlot ? 'active' : ''}`;
      
      let icon = '💎';
      if (item.type === BLOCK_TYPES.TNT) icon = '🧨';
      else if (item.type === BLOCK_TYPES.LOG) icon = '🪵';
      else if (item.type === BLOCK_TYPES.GRASS) icon = '🌱';
      else if (item.type === BLOCK_TYPES.OBSIDIAN) icon = '🔮';
      else if (item.type === BLOCK_TYPES.BRICK) icon = '🧱';
      else if (item.type === BLOCK_TYPES.STONE) icon = '🪨';
      else if (item.type === BLOCK_TYPES.COBBLE) icon = '⛰️';
      else if (item.type === 'SWORD') icon = '🗡️';

      slot.innerHTML = `
        <span class="slot-num">${idx + 1}</span>
        <span style="font-size: 20px;">${icon}</span>
        <span class="slot-count">${item.count}</span>
      `;

      slot.addEventListener('click', () => {
        this.player.selectedSlot = idx;
        this.player.updateHotbarUI();
      });

      hotbarEl.appendChild(slot);
    });
  }

  initChatConsole() {
    const chatBox = document.getElementById('game-chat-box');
    const chatInput = document.getElementById('input-chat');
    const chatMessages = document.getElementById('chat-messages');

    window.addEventListener('keydown', (e) => {
      if (e.key === 't' || e.key === 'T' || e.key === '/') {
        if (!this.player.isPointerLocked && chatBox && chatBox.style.display !== 'flex') {
          e.preventDefault();
          chatBox.style.display = 'flex';
          if (chatInput) {
            chatInput.value = e.key === '/' ? '/' : '';
            chatInput.focus();
          }
        }
      }
    });

    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const text = chatInput.value.trim();
          chatInput.value = '';
          chatBox.style.display = 'none';

          if (text) {
            this.handleChatMessage(text, chatMessages);
          }
        } else if (e.key === 'Escape') {
          chatBox.style.display = 'none';
        }
      });
    }
  }

  handleChatMessage(text, messagesEl) {
    const msgDiv = document.createElement('div');

    if (text.startsWith('.')) {
      const parts = text.slice(1).split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (cmd === 'help') {
        msgDiv.innerHTML = `§d[SpriteHack] §fCommands: .bind <module> <key>, .fly, .killaura, .theme, .say`;
      } else if (cmd === 'bind' && args.length >= 2) {
        const mod = this.spriteHack.getModule(args[0]);
        if (mod) {
          mod.keybind = 'Key' + args[1].toUpperCase();
          msgDiv.innerHTML = `§a[SpriteHack] §fBound ${mod.name} to [${args[1].toUpperCase()}]`;
          this.spriteHack.clickGUI.rebuildPanels();
        }
      } else if (cmd === 'fly') {
        const fly = this.spriteHack.getModule('Fly');
        this.spriteHack.toggleModule(fly);
        msgDiv.innerHTML = `§b[SpriteHack] §fToggled Fly: ${fly.enabled ? 'ON' : 'OFF'}`;
      } else {
        msgDiv.innerHTML = `§c[SpriteHack] §fUnknown command. Type .help for available cheat commands.`;
      }
    } else {
      msgDiv.innerHTML = `<span style="color: var(--accent-cyan); font-weight:700;">&lt;${this.accountManager.currentAccount.username}&gt;</span> ${text}`;
    }

    if (messagesEl) {
      messagesEl.appendChild(msgDiv);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.isInGame && this.player) {
      this.player.update(deltaTime);
      this.entityManager.update(deltaTime, this.player.position, this.voxelWorld);

      const gameContext = {
        player: this.player,
        world: this.voxelWorld,
        entityManager: this.entityManager,
        scene: this.scene,
        camera: this.camera,
        audio: this.audioEngine,
        ambientLight: this.ambientLight
      };

      this.spriteHack.onTick(gameContext);
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new SpriteHackApp();
});
