package net.spritehack.module;

import net.minecraft.client.MinecraftClient;
import net.minecraft.sound.SoundEvents;

public abstract class Module {

    public enum Category {
        COMBAT("Combat"),
        MOVEMENT("Movement"),
        RENDER("Render"),
        PLAYER("Player"),
        MACROS("Macros"),
        CLIENT("Client");

        public final String display;
        Category(String display) { this.display = display; }
    }

    protected String name;
    protected String description;
    protected Category category;
    protected boolean enabled;
    protected int keyBind;

    public Module(String name, String description, Category category) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.enabled = false;
        this.keyBind = -1;
    }

    public void onEnable() {}
    public void onDisable() {}
    public void onTick(MinecraftClient client) {}

    protected long lastToggleTime = 0;

    public void toggle() {
        long now = System.currentTimeMillis();
        if (now - lastToggleTime < 200) return; // 0.2s cooldown
        lastToggleTime = now;

        enabled = !enabled;
        if (enabled) onEnable();
        else onDisable();

        // Audio feedback on toggle
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc != null && mc.player != null) {
            mc.player.playSound(SoundEvents.UI_BUTTON_CLICK.value(), 0.5f, enabled ? 1.3f : 0.8f);
        }
    }

    public void setEnabled(boolean val) {
        if (val != enabled) toggle();
    }

    public String getName() { return name; }
    public String getDescription() { return description; }
    public Category getCategory() { return category; }
    public boolean isEnabled() { return enabled; }
    public int getKeyBind() { return keyBind; }
    public void setKeyBind(int key) { this.keyBind = key; }
}
