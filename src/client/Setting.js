// SpriteHack Setting System (Sliders, Checkboxes, Dropdowns, ColorPickers)
export class Setting {
  constructor(name, defaultValue, description = '') {
    this.name = name;
    this.value = defaultValue;
    this.defaultValue = defaultValue;
    this.description = description;
    this.onChangeCallback = null;
  }

  onChange(cb) {
    this.onChangeCallback = cb;
    return this;
  }

  setValue(val) {
    this.value = val;
    if (this.onChangeCallback) this.onChangeCallback(val);
  }
}

export class BooleanSetting extends Setting {
  constructor(name, defaultValue = false, description = '') {
    super(name, defaultValue, description);
    this.type = 'boolean';
  }

  toggle() {
    this.setValue(!this.value);
    return this.value;
  }
}

export class NumberSetting extends Setting {
  constructor(name, defaultValue, min = 0, max = 10, step = 0.1, description = '') {
    super(name, defaultValue, description);
    this.type = 'number';
    this.min = min;
    this.max = max;
    this.step = step;
  }
}

export class ModeSetting extends Setting {
  constructor(name, defaultValue, modes = [], description = '') {
    super(name, defaultValue, description);
    this.type = 'mode';
    this.modes = modes;
  }

  cycle() {
    const idx = this.modes.indexOf(this.value);
    const nextIdx = (idx + 1) % this.modes.length;
    this.setValue(this.modes[nextIdx]);
    return this.value;
  }
}

export class ColorSetting extends Setting {
  constructor(name, defaultHex = '#9d4edd', description = '') {
    super(name, defaultHex, description);
    this.type = 'color';
  }
}
