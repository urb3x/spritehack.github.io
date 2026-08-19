package net.spritehack.config;

import net.spritehack.SpriteHackMod;
import net.spritehack.module.Module;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

public class ConfigManager {

    private static final Path CONFIG_PATH = Paths.get(System.getProperty("user.home"), ".spritehack_binds.properties");

    public static void saveBinds() {
        try {
            Properties props = new Properties();
            if (SpriteHackMod.moduleManager != null) {
                for (Module mod : SpriteHackMod.moduleManager.getModules()) {
                    props.setProperty(mod.getName() + ".key", String.valueOf(mod.getKeyBind()));
                    props.setProperty(mod.getName() + ".enabled", String.valueOf(mod.isEnabled()));
                }
            }
            try (OutputStream out = Files.newOutputStream(CONFIG_PATH)) {
                props.store(out, "SpriteHack Binds & Enabled Modules Config");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void resetBinds() {
        if (SpriteHackMod.moduleManager != null) {
            for (Module mod : SpriteHackMod.moduleManager.getModules()) {
                mod.setKeyBind(-1);
            }
        }
        saveBinds();
    }

    public static void loadBinds() {
        try {
            if (!Files.exists(CONFIG_PATH)) return;
            Properties props = new Properties();
            try (InputStream in = Files.newInputStream(CONFIG_PATH)) {
                props.load(in);
            }
            if (SpriteHackMod.moduleManager != null) {
                for (Module mod : SpriteHackMod.moduleManager.getModules()) {
                    String keyVal = props.getProperty(mod.getName() + ".key", props.getProperty(mod.getName()));
                    if (keyVal != null) {
                        try {
                            mod.setKeyBind(Integer.parseInt(keyVal));
                        } catch (NumberFormatException ignored) {}
                    }

                    String enabledVal = props.getProperty(mod.getName() + ".enabled");
                    if (enabledVal != null) {
                        boolean shouldBeEnabled = Boolean.parseBoolean(enabledVal);
                        if (shouldBeEnabled != mod.isEnabled()) {
                            mod.toggle();
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
