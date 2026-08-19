// Wurst-Style ClickGUI Window Manager & Navigator
import { CATEGORY } from '../Module.js';

export class ClickGUI {
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
