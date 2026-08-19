package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.projectile.FishingBobberEntity;
import net.minecraft.util.Hand;
import net.spritehack.module.Module;

public class AutoFish extends Module {

    private boolean reeling = false;
    private long reelTime = 0;

    public AutoFish() {
        super("AutoFish", "Automatically reels and recasts fishing rod when a fish bites", Category.PLAYER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.interactionManager == null) return;

        FishingBobberEntity bobber = mc.player.fishHook;
        if (bobber != null) {
            if (bobber.isSubmergedInWater() && Math.abs(bobber.getVelocity().y) > 0.08) {
                if (!reeling) {
                    mc.interactionManager.interactItem(mc.player, Hand.MAIN_HAND);
                    reeling = true;
                    reelTime = System.currentTimeMillis();
                }
            }
        } else if (reeling && System.currentTimeMillis() - reelTime > 1000) {
            mc.interactionManager.interactItem(mc.player, Hand.MAIN_HAND);
            reeling = false;
        }
    }
}
