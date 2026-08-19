package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.minecraft.util.Hand;
import net.minecraft.util.hit.BlockHitResult;
import net.minecraft.util.hit.HitResult;
import net.minecraft.util.math.BlockPos;
import net.minecraft.util.math.Direction;
import net.spritehack.module.Module;

public class Nuker extends Module {

    public enum Mode {
        LEGIT("Legit Crosshair"),
        ALL("Rage 360 Sphere");

        public final String display;
        Mode(String display) { this.display = display; }
    }

    public Mode mode = Mode.LEGIT;
    public int radius = 4;

    public Nuker() {
        super("Nuker", "Automated multi-block miner (Legit Crosshair / 360° Rage)", Category.PLAYER);
    }

    public void cycleMode() {
        Mode[] modes = Mode.values();
        mode = modes[(mode.ordinal() + 1) % modes.length];
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.world == null || mc.interactionManager == null) return;

        if (mode == Mode.LEGIT) {
            // Legit Nuker: Fast-mines block under crosshair instantly when holding attack button
            if (mc.options.attackKey.isPressed() && mc.crosshairTarget != null && mc.crosshairTarget.getType() == HitResult.Type.BLOCK) {
                BlockHitResult bhr = (BlockHitResult) mc.crosshairTarget;
                BlockPos targetPos = bhr.getBlockPos();
                if (!mc.world.getBlockState(targetPos).isAir()) {
                    mc.interactionManager.updateBlockBreakingProgress(targetPos, bhr.getSide());
                    mc.player.swingHand(Hand.MAIN_HAND);
                }
            }
        } else {
            // Rage 360° Nuker: Mines all blocks in sphere radius around player
            BlockPos playerPos = mc.player.getBlockPos();
            int r = radius;

            for (int x = -r; x <= r; x++) {
                for (int y = -r; y <= r; y++) {
                    for (int z = -r; z <= r; z++) {
                        BlockPos pos = playerPos.add(x, y, z);
                        if (pos.isWithinDistance(mc.player.getPos(), r)) {
                            if (!mc.world.getBlockState(pos).isAir() && mc.world.getBlockState(pos).getHardness(mc.world, pos) >= 0) {
                                mc.interactionManager.updateBlockBreakingProgress(pos, Direction.UP);
                                mc.player.swingHand(Hand.MAIN_HAND);
                            }
                        }
                    }
                }
            }
        }
    }
}
