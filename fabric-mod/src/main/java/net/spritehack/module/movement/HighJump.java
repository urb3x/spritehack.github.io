package net.spritehack.module.movement;

import net.minecraft.client.MinecraftClient;
import net.minecraft.util.math.Vec3d;
import net.spritehack.module.Module;

public class HighJump extends Module {

    public HighJump() {
        super("HighJump", "Boosts player vertical jump height", Category.MOVEMENT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null) return;

        if (mc.player.isOnGround() && mc.options.jumpKey.isPressed()) {
            Vec3d vel = mc.player.getVelocity();
            mc.player.setVelocity(vel.x, 0.75, vel.z);
        }
    }
}
