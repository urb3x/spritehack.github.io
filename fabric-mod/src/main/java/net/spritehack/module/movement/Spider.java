package net.spritehack.module.movement;

import net.minecraft.client.MinecraftClient;
import net.minecraft.util.math.Vec3d;
import net.spritehack.module.Module;

public class Spider extends Module {

    public Spider() {
        super("Spider", "Allows climbing up vertical walls", Category.MOVEMENT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null) return;

        if (mc.player.horizontalCollision) {
            Vec3d vel = mc.player.getVelocity();
            mc.player.setVelocity(vel.x, 0.2, vel.z);
        }
    }
}
