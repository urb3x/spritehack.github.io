package net.spritehack.module.macros;

import net.minecraft.client.MinecraftClient;
import net.spritehack.SpriteHackMod;
import net.spritehack.module.Module;
import net.spritehack.module.combat.*;
import net.spritehack.module.movement.*;
import net.spritehack.module.player.*;
import net.spritehack.module.render.*;

public class BlatantMode extends Module {

    public BlatantMode() {
        super("BlatantMode", "Instantly turns ON the ultimate blatant cheat combo (KillAura, AutoCrystal, Fly, Speed, Velocity, AutoTotem, Criticals)", Category.MACROS);
    }

    @Override
    public void onEnable() {
        if (SpriteHackMod.moduleManager == null) return;

        // Turn ON ultimate blatant PvP combo
        enableIfDisabled(KillAura.class);
        enableIfDisabled(AutoCrystal.class);
        enableIfDisabled(Velocity.class);
        enableIfDisabled(Criticals.class);
        enableIfDisabled(AutoTotem.class);
        enableIfDisabled(AutoArmor.class);
        enableIfDisabled(Fly.class);
        enableIfDisabled(Speed.class);
        enableIfDisabled(ESP.class);
        enableIfDisabled(Tracers.class);
        enableIfDisabled(FullBright.class);
    }

    private <T extends Module> void enableIfDisabled(Class<T> clazz) {
        T mod = SpriteHackMod.moduleManager.getModule(clazz);
        if (mod != null && !mod.isEnabled()) {
            mod.toggle();
        }
    }
}
