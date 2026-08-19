package net.spritehack.module.movement;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class Sprint extends Module {
    public Sprint() { super("Sprint", "Always sprint (AutoSprint)", Category.MOVEMENT); }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null) return;
        if (mc.player.forwardSpeed > 0 && !mc.player.isSprinting()) {
            mc.player.setSprinting(true);
        }
    }
}
