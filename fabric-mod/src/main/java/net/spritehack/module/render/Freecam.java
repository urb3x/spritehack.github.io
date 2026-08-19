package net.spritehack.module.render;

import net.minecraft.client.MinecraftClient;
import net.minecraft.util.math.Vec3d;
import net.spritehack.module.Module;

public class Freecam extends Module {

    private double freecamX, freecamY, freecamZ;
    private float cameraYaw, cameraPitch;

    public Freecam() {
        super("Freecam", "Detaches camera for free flying inspection while player remains still", Category.RENDER);
    }

    @Override
    public void onEnable() {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc != null && mc.player != null) {
            Vec3d pos = mc.player.getEyePos();
            freecamX = pos.x;
            freecamY = pos.y;
            freecamZ = pos.z;
            cameraYaw = mc.player.getYaw();
            cameraPitch = mc.player.getPitch();
        }
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null) return;
        
        // Flight speed
        double speed = 0.5;
        
        // Calculate camera motion vectors
        double radYaw = Math.toRadians(cameraYaw);
        double dx = -Math.sin(radYaw) * speed;
        double dz = Math.cos(radYaw) * speed;

        if (mc.options.forwardKey.isPressed()) {
            freecamX += dx;
            freecamZ += dz;
        }
        if (mc.options.backKey.isPressed()) {
            freecamX -= dx;
            freecamZ -= dz;
        }
        if (mc.options.leftKey.isPressed()) {
            freecamX += dz;
            freecamZ -= dx;
        }
        if (mc.options.rightKey.isPressed()) {
            freecamX -= dz;
            freecamZ += dx;
        }
        if (mc.options.jumpKey.isPressed()) {
            freecamY += speed;
        }
        if (mc.options.sneakKey.isPressed()) {
            freecamY -= speed;
        }
    }

    public void updateCamera(double deltaX, double deltaY) {
        cameraYaw += (float) (deltaX * 0.15F);
        cameraPitch += (float) (deltaY * 0.15F);
        cameraPitch = Math.max(-90.0F, Math.min(90.0F, cameraPitch));
    }

    public double getFreecamX() { return freecamX; }
    public double getFreecamY() { return freecamY; }
    public double getFreecamZ() { return freecamZ; }
    public float getCameraYaw() { return cameraYaw; }
    public float getCameraPitch() { return cameraPitch; }
}
