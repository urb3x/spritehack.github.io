package net.spritehack.module.combat;

import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.Entity;
import net.minecraft.entity.LivingEntity;
import net.minecraft.entity.mob.HostileEntity;
import net.minecraft.entity.mob.MobEntity;
import net.minecraft.entity.passive.AnimalEntity;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.util.Hand;
import net.spritehack.module.Module;

public class KillAura extends Module {

    public enum TargetMode {
        PLAYERS("Players Only"),
        HOSTILE("Hostile Mobs"),
        PASSIVE("Passive Animals"),
        ALL("All Entities");

        public final String display;
        TargetMode(String display) { this.display = display; }
    }

    public float range = 4.5f;
    public TargetMode targetMode = TargetMode.ALL;

    public KillAura() {
        super("KillAura", "Silent 360° Max-DPS Auto-Attack (Looking anywhere allowed)", Category.COMBAT);
    }

    public void cycleTargetMode() {
        TargetMode[] modes = TargetMode.values();
        targetMode = modes[(targetMode.ordinal() + 1) % modes.length];
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.world == null || mc.interactionManager == null) return;
        if (mc.currentScreen != null) return;

        // Maximum DPS: Wait until 1.20.4 weapon attack cooldown reaches 90%+
        if (mc.player.getAttackCooldownProgress(0.5f) < 0.90f) return;

        LivingEntity target = null;
        double closestDist = range * range;

        for (Entity e : mc.world.getEntities()) {
            if (!(e instanceof LivingEntity living)) continue;
            if (e == mc.player) continue;
            if (living.isDead() || living.getHealth() <= 0) continue;

            // Target filtering
            boolean valid = switch (targetMode) {
                case PLAYERS -> living instanceof PlayerEntity;
                case HOSTILE -> living instanceof HostileEntity || (living instanceof MobEntity mob && mob.isAttacking());
                case PASSIVE -> living instanceof AnimalEntity;
                case ALL     -> true;
            };

            if (!valid) continue;

            double dist = mc.player.squaredDistanceTo(e);
            if (dist < closestDist) {
                closestDist = dist;
                target = living;
            }
        }

        if (target != null) {
            // Silent 360° Attack without overriding client camera look
            mc.interactionManager.attackEntity(mc.player, target);
            mc.player.swingHand(Hand.MAIN_HAND);
        }
    }
}
