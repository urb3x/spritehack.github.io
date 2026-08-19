package net.spritehack.module.combat;

import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.Entity;
import net.minecraft.entity.LivingEntity;
import net.spritehack.module.Module;

public class Aimbot extends Module {

    public float fov = 360f;
    public float smooth = 5.0f;

    public Aimbot() {
        super("Aimbot", "Smooth Vape-style auto-aim targeting nearest entity head", Category.COMBAT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.world == null) return;
        if (mc.currentScreen != null) return;

        LivingEntity target = null;
        double closestDist = 8.0 * 8.0;

        for (Entity e : mc.world.getEntities()) {
            if (!(e instanceof LivingEntity living)) continue;
            if (e == mc.player) continue;
            if (living.isDead() || living.getHealth() <= 0) continue;

            double dist = mc.player.squaredDistanceTo(e);
            if (dist < closestDist) {
                closestDist = dist;
                target = living;
            }
        }

        if (target == null) return;

        double dx = target.getX() - mc.player.getX();
        double dy = target.getEyeY() - mc.player.getEyeY();
        double dz = target.getZ() - mc.player.getZ();

        double dist = Math.sqrt(dx * dx + dz * dz);
        float targetYaw = (float)(Math.toDegrees(Math.atan2(dz, dx))) - 90f;
        float targetPitch = (float)(-Math.toDegrees(Math.atan2(dy, dist)));

        float diffYaw = wrapDeg(targetYaw - mc.player.getYaw());
        float diffPitch = targetPitch - mc.player.getPitch();

        mc.player.setYaw(mc.player.getYaw() + diffYaw / smooth);
        mc.player.setPitch(mc.player.getPitch() + diffPitch / smooth);
    }

    private float wrapDeg(float deg) {
        while (deg > 180f) deg -= 360f;
        while (deg < -180f) deg += 360f;
        return deg;
    }
}
