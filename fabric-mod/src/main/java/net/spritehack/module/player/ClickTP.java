package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.minecraft.util.hit.BlockHitResult;
import net.minecraft.util.hit.HitResult;
import net.minecraft.util.math.BlockPos;
import net.spritehack.module.Module;

public class ClickTP extends Module {

    public ClickTP() {
        super("ClickTP", "Teleports instantly to targeted block when right-clicking mouse", Category.PLAYER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.world == null) return;

        if (mc.options.useKey.wasPressed()) {
            HitResult hit = mc.crosshairTarget;
            if (hit != null && hit.getType() == HitResult.Type.BLOCK) {
                BlockHitResult blockHit = (BlockHitResult) hit;
                BlockPos pos = blockHit.getBlockPos().offset(blockHit.getSide());

                // Teleport player to targeted block location
                mc.player.setPosition(pos.getX() + 0.5, pos.getY(), pos.getZ() + 0.5);
            }
        }
    }
}
