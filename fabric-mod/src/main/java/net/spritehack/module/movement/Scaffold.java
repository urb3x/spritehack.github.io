package net.spritehack.module.movement;

import net.minecraft.client.MinecraftClient;
import net.minecraft.item.BlockItem;
import net.minecraft.util.Hand;
import net.minecraft.util.hit.BlockHitResult;
import net.minecraft.util.math.BlockPos;
import net.minecraft.util.math.Direction;
import net.minecraft.util.math.Vec3d;
import net.spritehack.module.Module;

public class Scaffold extends Module {

    public Scaffold() {
        super("Scaffold", "Godbridge & Downward stair scaffold for fast bridging", Category.MOVEMENT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.world == null || mc.interactionManager == null) return;

        BlockPos underPos = mc.player.getBlockPos().down();
        // Downward scaffold support: if player is sneaking or pitching down > 45 deg, place 2 blocks down
        if (mc.player.isSneaking() || mc.player.getPitch() > 45.0f) {
            underPos = underPos.down();
        }

        // Check if there is air below target position
        if (mc.world.getBlockState(underPos).isAir()) {
            int blockSlot = -1;
            for (int i = 0; i < 9; i++) {
                if (mc.player.getInventory().getStack(i).getItem() instanceof BlockItem) {
                    blockSlot = i;
                    break;
                }
            }

            if (blockSlot != -1) {
                int oldSlot = mc.player.getInventory().selectedSlot;
                mc.player.getInventory().selectedSlot = blockSlot;

                Vec3d hitVec = new Vec3d(underPos.getX() + 0.5, underPos.getY() + 0.5, underPos.getZ() + 0.5);
                BlockHitResult hit = new BlockHitResult(hitVec, Direction.UP, underPos, false);
                mc.interactionManager.interactBlock(mc.player, Hand.MAIN_HAND, hit);
                mc.player.swingHand(Hand.MAIN_HAND);

                mc.player.getInventory().selectedSlot = oldSlot;
            }
        }
    }
}
