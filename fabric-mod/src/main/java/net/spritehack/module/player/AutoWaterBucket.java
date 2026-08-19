package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.minecraft.item.Items;
import net.minecraft.util.Hand;
import net.minecraft.util.hit.BlockHitResult;
import net.minecraft.util.hit.HitResult;
import net.minecraft.util.math.BlockPos;
import net.minecraft.util.math.Direction;
import net.minecraft.util.math.Vec3d;
import net.minecraft.world.RaycastContext;
import net.spritehack.module.Module;

public class AutoWaterBucket extends Module {

    private boolean clutched = false;
    private int pickupTimer = 0;

    public AutoWaterBucket() {
        super("AutoWater", "Auto Water Bucket Clutch & Instant Pickup", Category.PLAYER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.world == null || mc.interactionManager == null) return;

        // Reset state when safe on ground
        if (mc.player.isOnGround() && !mc.player.isTouchingWater()) {
            clutched = false;
            pickupTimer = 0;
        }

        // Trigger when falling with downward velocity
        boolean isFalling = mc.player.fallDistance >= 1.5f || (mc.player.getVelocity().y < -0.3 && !mc.player.isOnGround());

        if (isFalling && !clutched) {
            Vec3d eye = mc.player.getEyePos();
            Vec3d rayEnd = eye.add(0, -4.5, 0);

            BlockHitResult hit = mc.world.raycast(new RaycastContext(
                eye,
                rayEnd,
                RaycastContext.ShapeType.COLLIDER,
                RaycastContext.FluidHandling.NONE,
                mc.player
            ));

            if (hit != null && hit.getType() == HitResult.Type.BLOCK) {
                int waterSlot = findSlot(mc, Items.WATER_BUCKET);
                if (waterSlot != -1) {
                    mc.player.getInventory().selectedSlot = waterSlot;

                    // Place water on top of hit block
                    BlockHitResult placeHit = new BlockHitResult(hit.getPos(), Direction.UP, hit.getBlockPos(), false);
                    mc.interactionManager.interactBlock(mc.player, Hand.MAIN_HAND, placeHit);
                    mc.interactionManager.interactItem(mc.player, Hand.MAIN_HAND);
                    mc.player.swingHand(Hand.MAIN_HAND);

                    clutched = true;
                    pickupTimer = 0;
                }
            }
        }

        // Instant Water Pickup after clutch
        if (clutched) {
            pickupTimer++;
            if (pickupTimer >= 2 || mc.player.isOnGround() || mc.player.isTouchingWater()) {
                int bucketSlot = findSlot(mc, Items.BUCKET);
                if (bucketSlot != -1) {
                    mc.player.getInventory().selectedSlot = bucketSlot;

                    BlockPos posUnder = mc.player.getBlockPos();
                    Vec3d hitVec = new Vec3d(posUnder.getX() + 0.5, posUnder.getY() + 0.5, posUnder.getZ() + 0.5);
                    BlockHitResult bhr = new BlockHitResult(hitVec, Direction.UP, posUnder, false);

                    mc.interactionManager.interactBlock(mc.player, Hand.MAIN_HAND, bhr);
                    mc.interactionManager.interactItem(mc.player, Hand.MAIN_HAND);
                    mc.player.swingHand(Hand.MAIN_HAND);
                }
                clutched = false;
                pickupTimer = 0;
            }
        }
    }

    private int findSlot(MinecraftClient mc, net.minecraft.item.Item item) {
        for (int i = 0; i < 9; i++) {
            if (mc.player.getInventory().getStack(i).isOf(item)) {
                return i;
            }
        }
        return -1;
    }
}
