package net.spritehack.module.combat;

import net.minecraft.client.MinecraftClient;
import net.minecraft.util.math.Vec3d;
import net.spritehack.module.Module;

public class Velocity extends Module {

    public float horizontal = 0.0f; // 100% Full cancellation
    public float vertical = 0.0f;   // 100% Full cancellation

    public Velocity() {
        super("Velocity", "100% Full knockback cancellation (0% KB taken)", Category.COMBAT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null) return;
        if (mc.player.hurtTime > 0) {
            Vec3d v = mc.player.getVelocity();
            mc.player.setVelocity(v.x * horizontal, v.y * vertical, v.z * horizontal);
        }
    }
}
