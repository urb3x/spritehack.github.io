import { KillAura, Aimbot, Criticals, Velocity, TriggerBot, CrystalAura, SpinBot, AutoArmor, Reach } from './modules/combat/CombatModules.js';
import { Fly, Speed, Scaffold, Step, NoClip, Jesus, Spider, AirJump, SafeWalk, HighJump } from './modules/movement/MovementModules.js';
import { Wallhack, ESP3D, Tracers, Fullbright, Freecam, Perspective, BlockESP, XRay, Trajectories, Breadcrumbs, Nametags, TargetHUD } from './modules/render/RenderModules.js';
import { FastPlace, FastBreak, NoFall, AutoWater, AutoEat, ChestStealer, Nuker, AutoTool, AntiAFK, AutoTotem, Blink, TimerMod, AutoRespawn, ClickGUIModule, HUDModule, ArrayListModule, CustomThemeModule } from './modules/player/PlayerModules.js';
import { ClickGUI } from './gui/ClickGUI.js';
import { TabGUI } from './gui/TabGUI.js';
import { HUD } from './gui/HUD.js';
import { NotificationManager } from './gui/NotificationManager.js';

export class SpriteHack {
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
