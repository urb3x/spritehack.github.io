export class HUD {
  constructor(spriteHack) {
    this.client = spriteHack;
    this.arraylistContainer = document.getElementById('hud-arraylist');
    this.targetHud = document.getElementById('target-hud');
    this.fpsEl = document.getElementById('hud-fps-val');
    this.coordsEl = document.getElementById('hud-coords-val');

    this.frameCount = 0;
    this.lastFpsTime = performance.now();
    this.currentFps = 60;
  }

  onTick({ player }) {
    // 1. Calculate FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = now;
      if (this.fpsEl) this.fpsEl.textContent = this.currentFps;
    }

    // 2. Coordinates
    if (this.coordsEl && player) {
      const px = Math.floor(player.position.x);
      const py = Math.floor(player.position.y);
      const pz = Math.floor(player.position.z);
      this.coordsEl.textContent = `${px} / ${py} / ${pz}`;
    }

    // 3. TargetHUD
    const aura = this.client.getModule('KillAura');
    const aim = this.client.getModule('Aimbot');
    const target = (aura && aura.enabled && aura.currentTarget) || null;

    if (target && this.targetHud) {
      this.targetHud.classList.add('active');
      const nameEl = document.getElementById('target-hud-name');
      const hpBar = document.getElementById('target-hud-health');
      const hpNum = document.getElementById('target-hud-hp-num');
      const distNum = document.getElementById('target-hud-dist-num');

      if (nameEl) nameEl.textContent = target.name;
      if (hpNum) hpNum.textContent = target.health.toFixed(1);
      
      const hpPercent = Math.max(0, Math.min(100, (target.health / target.maxHealth) * 100));
      if (hpBar) hpBar.style.width = `${hpPercent}%`;

      const dx = target.position.x - player.position.x;
      const dz = target.position.z - player.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (distNum) distNum.textContent = `${dist.toFixed(1)}m`;
    } else if (this.targetHud) {
      this.targetHud.classList.remove('active');
    }
  }

  updateArrayList() {
    if (!this.arraylistContainer) return;
    this.arraylistContainer.innerHTML = '';

    const active = this.client.modules
      .filter(m => m.enabled && m.category !== 'Client')
      .sort((a, b) => b.name.length - a.name.length);

    active.forEach((mod, idx) => {
      const item = document.createElement('div');
      item.className = 'wurst-array-item';
      
      // Wurst green / neon rainbow wave
      const hue = (idx * 28 + performance.now() * 0.04) % 360;
      item.style.borderRightColor = `hsl(${hue}, 90%, 55%)`;
      item.style.color = `#fff`;

      item.innerHTML = `<span>${mod.name}</span>`;
      this.arraylistContainer.appendChild(item);
    });
  }
}
