import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/pit2/Desktop/spritehack/src/client';

const files = [
  'Setting.js',
  'Module.js',
  'modules/combat/CombatModules.js',
  'modules/movement/MovementModules.js',
  'modules/render/RenderModules.js',
  'modules/player/PlayerModules.js',
  'gui/NotificationManager.js',
  'gui/HUD.js',
  'gui/TabGUI.js',
  'gui/ClickGUI.js',
  'SpriteHack.js'
];

let bundledCode = `/**\n * SpriteHack Client v3.5.0 (Single-File Mod Bundle)\n * Combined Standalone Mod: spritemod1.20.4.js\n */\n\n`;
bundledCode += `(function(window) {\n  'use strict';\n\n`;

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip import statements
  content = content.replace(/^import\s+.*?;?\s*$/gm, '');

  // Strip export keywords
  content = content.replace(/^export\s+default\s+/gm, '');
  content = content.replace(/^export\s+/gm, '');

  bundledCode += `  // --- Section: ${file} ---\n`;
  bundledCode += content.trim() + `\n\n`;
});

// Expose SpriteHack globally on window object
bundledCode += `  window.SpriteHack = SpriteHack;\n`;
bundledCode += `})(window);\n`;

const targetPath = 'c:/Users/pit2/Desktop/spritehack/spritemod1.20.4.js';
fs.writeFileSync(targetPath, bundledCode, 'utf8');
console.log(`[SUCCESS] Generated single-file mod: ${targetPath} (${fs.statSync(targetPath).size} bytes)`);
