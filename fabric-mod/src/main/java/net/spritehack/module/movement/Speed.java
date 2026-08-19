package net.spritehack.module.movement;

import net.minecraft.client.MinecraftClient;
import net.minecraft.util.math.Vec3d;
import net.spritehack.module.Module;

public class Speed extends Module {

    public float multiplier = 2.0f;

    public Speed() {
        super("Speed", "Increases movement speed (BHop)", Category.MOVEMENT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null) return;
        if (!mc.player.isOnGround()) return;
        if (mc.player.input.movementForward == 0 && mc.player.input.movementSideways == 0) return;

        Vec3d vel = mc.player.getVelocity();
        double horzSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);

        if (horzSpeed > 0) {
            double boost = (horzSpeed * multiplier - horzSpeed);
            double ratio = boost / horzSpeed;
            mc.player.setVelocity(vel.x + vel.x * ratio, vel.y, vel.z + vel.z * ratio);
        }
    }
}
