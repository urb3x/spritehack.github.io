package net.spritehack.module.render;

import net.minecraft.client.MinecraftClient;
import net.minecraft.client.font.TextRenderer;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.item.*;
import net.minecraft.util.hit.BlockHitResult;
import net.minecraft.util.hit.HitResult;
import net.minecraft.util.math.BlockPos;
import net.minecraft.util.math.Vec3d;
import net.minecraft.world.RaycastContext;
import net.spritehack.gui.ClickGUI;
import net.spritehack.module.Module;

import java.util.ArrayList;
import java.util.List;

public class Trajectories extends Module {

    public Trajectories() {
        super("Trajectories", "Predicts thrown item & bow arrow flight path and landing block", Category.RENDER);
    }

    public static void renderHUD(DrawContext ctx, TextRenderer tr) {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc.player == null || mc.world == null) return;

        ItemStack stack = mc.player.getMainHandStack();
        if (stack.isEmpty()) stack = mc.player.getOffHandStack();

        Item item = stack.getItem();
        if (!(item instanceof BowItem || item instanceof CrossbowItem || item instanceof EnderPearlItem 
            || item instanceof SnowballItem || item instanceof EggItem || item instanceof TridentItem 
            || item instanceof PotionItem || item instanceof ExperienceBottleItem)) {
            return;
        }

        // Calculate initial velocity & gravity
        double speed = 1.5;
        double gravity = 0.03;

        if (item instanceof BowItem) {
            int useTicks = mc.player.getItemUseTime();
            float pull = BowItem.getPullProgress(useTicks);
            if (pull < 0.1f) pull = 1.0f;
            speed = pull * 3.0;
            gravity = 0.05;
        } else if (item instanceof CrossbowItem) {
            speed = 3.15;
            gravity = 0.04;
        } else if (item instanceof PotionItem || item instanceof ExperienceBottleItem) {
            speed = 0.5;
            gravity = 0.05;
        } else if (item instanceof TridentItem) {
            speed = 2.5;
            gravity = 0.05;
        }

        Vec3d eyePos = mc.player.getEyePos();
        Vec3d lookVec = mc.player.getRotationVector();
        Vec3d velocity = lookVec.multiply(speed);

        Vec3d currentPos = eyePos;
        HitResult hitResult = null;
        List<Vec3d> path = new ArrayList<>();
        path.add(currentPos);

        for (int i = 0; i < 100; i++) {
            Vec3d nextPos = currentPos.add(velocity);
            BlockHitResult hit = mc.world.raycast(new RaycastContext(
                currentPos,
                nextPos,
                RaycastContext.ShapeType.COLLIDER,
                RaycastContext.FluidHandling.NONE,
                mc.player
            ));

            if (hit != null && hit.getType() != HitResult.Type.MISS) {
                hitResult = hit;
                path.add(hit.getPos());
                break;
            }

            currentPos = nextPos;
            path.add(currentPos);
            velocity = velocity.multiply(0.99).add(0, -gravity, 0);
        }

        // Render trajectory path dotted flight line on screen
        int accent = ClickGUI.getAccentColor(0);
        int screenW = ctx.getScaledWindowWidth();
        int screenH = ctx.getScaledWindowHeight();

        for (int i = 0; i < path.size() - 1; i++) {
            double progress = (double) i / (double) path.size();
            int dotX = (int) (screenW / 2 + (lookVec.x * i * 3.5));
            int dotY = (int) (screenH / 2 + (lookVec.y * i * 3.5) + (i * i * 0.08));

            if (dotX >= 0 && dotX < screenW && dotY >= 0 && dotY < screenH) {
                ctx.fill(dotX - 1, dotY - 1, dotX + 1, dotY + 1, accent);
            }
        }

        // Render 🎯 Landing Target Box on the exact impact block (Without numbers)
        if (hitResult != null && hitResult instanceof BlockHitResult bhr) {
            BlockPos targetBlock = bhr.getBlockPos();
            int cx = screenW / 2;
            int cy = screenH / 2 + 16;

            String label = "🎯 Target: " + targetBlock.getX() + ", " + targetBlock.getY() + ", " + targetBlock.getZ();
            int w = tr.getWidth(label) + 10;

            ctx.fill(cx - w / 2, cy, cx + w / 2, cy + 14, 0xD00B0E17);
            ctx.fill(cx - w / 2, cy + 13, cx + w / 2, cy + 14, accent);
            ctx.drawTextWithShadow(tr, label, cx - tr.getWidth(label) / 2, cy + 3, accent);
        }
    }
}
