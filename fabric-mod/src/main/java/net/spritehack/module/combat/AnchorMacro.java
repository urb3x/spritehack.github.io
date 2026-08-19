package net.spritehack.module.combat;

import net.minecraft.block.Blocks;
import net.minecraft.client.MinecraftClient;
import net.minecraft.item.Items;
import net.minecraft.util.Hand;
import net.minecraft.util.hit.BlockHitResult;
import net.minecraft.util.math.BlockPos;
import net.minecraft.util.math.Direction;
import net.minecraft.util.math.Vec3d;
import net.spritehack.module.Module;

public class AnchorMacro extends Module {

    private long lastAction = 0;

    public AnchorMacro() {
        super("AnchorMacro", "Automated Respawn Anchor + Glowstone charging macro for 1.20.4 Anarchy", Category.COMBAT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.world == null || mc.interactionManager == null) return;

        long now = System.currentTimeMillis();
        if (now - lastAction < 100) return;

        BlockPos playerPos = mc.player.getBlockPos();
        for (int x = -3; x <= 3; x++) {
            for (int y = -1; y <= 2; y++) {
                for (int z = -3; z <= 3; z++) {
                    BlockPos pos = playerPos.add(x, y, z);
                    net.minecraft.block.BlockState state = mc.world.getBlockState(pos);

                    if (state.getBlock() == Blocks.RESPAWN_ANCHOR) {
                        int glowstoneSlot = findSlot(mc, Items.GLOWSTONE);
                        int oldSlot = mc.player.getInventory().selectedSlot;

                        if (glowstoneSlot != -1) {
                            // Charge Respawn Anchor with Glowstone
                            mc.player.getInventory().selectedSlot = glowstoneSlot;
                            Vec3d hitVec = new Vec3d(pos.getX() + 0.5, pos.getY() + 0.5, pos.getZ() + 0.5);
                            BlockHitResult bhr = new BlockHitResult(hitVec, Direction.UP, pos, false);
                            mc.interactionManager.interactBlock(mc.player, Hand.MAIN_HAND, bhr);
                            mc.player.swingHand(Hand.MAIN_HAND);
                            mc.player.getInventory().selectedSlot = oldSlot;
                            lastAction = now;
                            return;
                        } else {
                            // Trigger explosion on charged anchor
                            Vec3d hitVec = new Vec3d(pos.getX() + 0.5, pos.getY() + 0.5, pos.getZ() + 0.5);
                            BlockHitResult bhr = new BlockHitResult(hitVec, Direction.UP, pos, false);
                            mc.interactionManager.interactBlock(mc.player, Hand.MAIN_HAND, bhr);
                            mc.player.swingHand(Hand.MAIN_HAND);
                            lastAction = now;
                            return;
                        }
                    }
                }
            }
        }
    }

    private int findSlot(MinecraftClient mc, net.minecraft.item.Item item) {
        for (int i = 0; i < 9; i++) {
            if (mc.player.getInventory().getStack(i).isOf(item)) return i;
        }
        return -1;
    }
}
