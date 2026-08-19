package net.spritehack.module.movement;

import net.minecraft.client.MinecraftClient;
import net.minecraft.util.math.Vec3d;
import net.spritehack.module.Module;

public class Jesus extends Module {

    public Jesus() {
        super("Jesus", "Walk on water and lava surfaces freely", Category.MOVEMENT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.world == null) return;

        // If in liquid or just above liquid surface
        if (mc.player.isTouchingWater() || mc.player.isInLava()) {
            Vec3d vel = mc.player.getVelocity();
            mc.player.setVelocity(vel.x, 0.11, vel.z);
            mc.player.setOnGround(true);
        } else if (mc.world.getBlockState(mc.player.getBlockPos().down()).getFluidState().isStill()) {
            if (mc.player.getVelocity().y < 0) {
                Vec3d vel = mc.player.getVelocity();
                mc.player.setVelocity(vel.x, 0.0, vel.z);
                mc.player.setOnGround(true);
            }
        }
    }
}
