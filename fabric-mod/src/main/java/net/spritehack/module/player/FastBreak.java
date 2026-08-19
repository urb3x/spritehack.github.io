package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.minecraft.util.Hand;
import net.minecraft.util.hit.BlockHitResult;
import net.minecraft.util.hit.HitResult;
import net.spritehack.module.Module;

public class FastBreak extends Module {

    public FastBreak() {
        super("FastBreak", "Instant / Fast Block Breaking (Speed Mine)", Category.PLAYER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.interactionManager == null || mc.crosshairTarget == null) return;

        if (mc.options.attackKey.isPressed() && mc.crosshairTarget.getType() == HitResult.Type.BLOCK) {
            BlockHitResult bhr = (BlockHitResult) mc.crosshairTarget;
            // Instantly break targeted block
            mc.interactionManager.updateBlockBreakingProgress(bhr.getBlockPos(), bhr.getSide());
            mc.player.swingHand(Hand.MAIN_HAND);
        }
    }
}
