// Wurst-Inspired TabGUI (Keyboard Arrow-Key Navigation on Top-Left HUD)
import { CATEGORY } from '../Module.js';

export class TabGUI {
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
