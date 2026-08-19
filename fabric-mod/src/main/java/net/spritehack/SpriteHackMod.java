package net.spritehack;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.fabricmc.fabric.api.client.rendering.v1.HudRenderCallback;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.util.InputUtil;
import net.spritehack.gui.ClickGUI;
import net.spritehack.hud.HudRenderer;
import net.spritehack.module.ModuleManager;
import org.lwjgl.glfw.GLFW;

import java.util.HashSet;
import java.util.Set;

public class SpriteHackMod implements ClientModInitializer {

    public static final String MOD_ID = "spritehack";
    public static final String MOD_NAME = "SpriteHack";
    public static final String VERSION = "3.5.0";

    public static SpriteHackMod INSTANCE;
    public static ModuleManager moduleManager;
    public static ClickGUI clickGUI;

    private static KeyBinding openGuiKey;
    private static final Set<Integer> pressedKeys = new HashSet<>();
    private static boolean rShiftWasPressed = false;

    @Override
    public void onInitializeClient() {
        INSTANCE = this;

        // Register Right Shift keybind (Vape/Wurst style)
        openGuiKey = KeyBindingHelper.registerKeyBinding(new KeyBinding(
            "key.spritehack.clickgui",
            InputUtil.Type.KEYSYM,
            GLFW.GLFW_KEY_RIGHT_SHIFT,
            "SpriteHack"
        ));

        // Initialize module manager and all modules
        moduleManager = new ModuleManager();

        // Load saved keybinds from previous sessions
        net.spritehack.config.ConfigManager.loadBinds();

        // Initialize ClickGUI
        clickGUI = new ClickGUI();

        // Tick event - check for keybind press and run modules
        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            if (client.player == null) return;

            long windowHandle = client.getWindow().getHandle();

            // Open ClickGUI with Right Shift (debounced press)
            boolean rShiftIsDown = openGuiKey.wasPressed() || InputUtil.isKeyPressed(windowHandle, GLFW.GLFW_KEY_RIGHT_SHIFT);
            if (rShiftIsDown) {
                if (!rShiftWasPressed && client.currentScreen == null) {
                    client.setScreen(clickGUI);
                }
                rShiftWasPressed = true;
            } else {
                rShiftWasPressed = false;
            }

            // Check custom module keybinds (debounced per key - toggles once per release & press)
            if (client.currentScreen == null) {
                for (net.spritehack.module.Module mod : moduleManager.getModules()) {
                    int key = mod.getKeyBind();
                    if (key > 0) {
                        boolean isDown = InputUtil.isKeyPressed(windowHandle, key);
                        if (isDown) {
                            if (!pressedKeys.contains(key)) {
                                pressedKeys.add(key);
                                mod.toggle();
                            }
                        } else {
                            pressedKeys.remove(key);
                        }
                    }
                }
            }

            // Tick all enabled modules
            moduleManager.onTick(client);
        });

        // Register HUD renderer (ArrayList + Watermark)
        HudRenderCallback.EVENT.register((drawContext, tickDelta) -> {
            if (MinecraftClient.getInstance().player == null) return;
            HudRenderer.render(drawContext, tickDelta);
        });

        System.out.println("[SpriteHack] Initialized - Right Shift to open ClickGUI");
    }

    public static ModuleManager getModuleManager() { return moduleManager; }
    public static ClickGUI getClickGUI() { return clickGUI; }
}
