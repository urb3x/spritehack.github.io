package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.minecraft.util.Hand;
import net.minecraft.util.hit.BlockHitResult;
import net.minecraft.util.math.BlockPos;
import net.minecraft.util.math.Direction;
import net.minecraft.util.math.Vec3d;
import net.spritehack.module.Module;

import java.util.ArrayList;
import java.util.List;

public class BoxMacro extends Module {

    public static int boxSize = 1; // 1 = 1x1, 2 = 2x2, 3 = 3x3

    public BoxMacro() {
        super("BoxMacro", "Auto builds a box around player (Right-click in GUI to adjust size)", Category.MACROS);
    }

    public static void cycleSize() {
        boxSize++;
        if (boxSize > 3) boxSize = 1;
    }

    @Override
    public String getName() {
        return "BoxMacro [" + boxSize + "x" + boxSize + "]";
    }

    @Override
    public void toggle() {
        executeMacro();
    }

    public void executeMacro() {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc.player == null || mc.world == null || mc.interactionManager == null) return;

        BlockPos playerPos = mc.player.getBlockPos();
        List<BlockPos> boxPositions = new ArrayList<>();

        int r = boxSize;

        // Build walls around player
        for (int x = -r; x <= r; x++) {
            for (int z = -r; z <= r; z++) {
                if (Math.abs(x) == r || Math.abs(z) == r) {
                    boxPositions.add(playerPos.add(x, 0, z));
                    boxPositions.add(playerPos.add(x, 1, z));
                }
            }
        }

        // Build roof
        for (int x = -r; x <= r; x++) {
            for (int z = -r; z <= r; z++) {
                boxPositions.add(playerPos.add(x, 2, z));
            }
        }

        for (BlockPos pos : boxPositions) {
            if (mc.world.getBlockState(pos).isAir()) {
                Vec3d hitVec = new Vec3d(pos.getX() + 0.5, pos.getY() + 0.5, pos.getZ() + 0.5);
                BlockHitResult hit = new BlockHitResult(hitVec, Direction.UP, pos, false);
                mc.interactionManager.interactBlock(mc.player, Hand.MAIN_HAND, hit);
            }
        }

        this.enabled = false;
    }
}
