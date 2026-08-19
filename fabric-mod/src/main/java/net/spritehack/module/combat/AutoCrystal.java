package net.spritehack.module.combat;

import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.decoration.EndCrystalEntity;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.item.Items;
import net.minecraft.util.Hand;
import net.minecraft.util.hit.BlockHitResult;
import net.minecraft.util.math.BlockPos;
import net.minecraft.util.math.Direction;
import net.minecraft.util.math.Vec3d;
import net.spritehack.module.Module;

public class AutoCrystal extends Module {

    private long lastBreak = 0;
    private long lastPlace = 0;

    public AutoCrystal() {
        super("AutoCrystal", "High-speed End Crystal placement & breaking for Anarchy PvP", Category.COMBAT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.world == null || mc.interactionManager == null) return;

        // 1. Break nearby End Crystals near enemies
        long now = System.currentTimeMillis();
        for (net.minecraft.entity.Entity e : mc.world.getEntities()) {
            if (e instanceof EndCrystalEntity crystal && crystal.isAlive()) {
                if (mc.player.squaredDistanceTo(crystal) <= 25.0) { // 5 blocks range
                    if (now - lastBreak >= 50) { // 20 CPS break
                        lastBreak = now;
                        mc.interactionManager.attackEntity(mc.player, crystal);
                        mc.player.swingHand(Hand.MAIN_HAND);
                        return;
                    }
                }
            }
        }

        // 2. Place End Crystal on Obsidian/Bedrock near target player
        if (now - lastPlace >= 80) {
            int crystalSlot = findSlot(mc, Items.END_CRYSTAL);
            if (crystalSlot != -1) {
                BlockPos playerPos = mc.player.getBlockPos();
                for (int x = -4; x <= 4; x++) {
                    for (int y = -2; y <= 2; y++) {
                        for (int z = -4; z <= 4; z++) {
                            BlockPos pos = playerPos.add(x, y, z);
                            net.minecraft.block.Block block = mc.world.getBlockState(pos).getBlock();
                            if (block == net.minecraft.block.Blocks.OBSIDIAN || block == net.minecraft.block.Blocks.BEDROCK) {
                                if (mc.world.getBlockState(pos.up()).isAir()) {
                                    int oldSlot = mc.player.getInventory().selectedSlot;
                                    mc.player.getInventory().selectedSlot = crystalSlot;

                                    Vec3d hitVec = new Vec3d(pos.getX() + 0.5, pos.getY() + 1.0, pos.getZ() + 0.5);
                                    BlockHitResult bhr = new BlockHitResult(hitVec, Direction.UP, pos, false);
                                    mc.interactionManager.interactBlock(mc.player, Hand.MAIN_HAND, bhr);
                                    mc.player.swingHand(Hand.MAIN_HAND);

                                    mc.player.getInventory().selectedSlot = oldSlot;
                                    lastPlace = now;
                                    return;
                                }
                            }
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
