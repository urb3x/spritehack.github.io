package net.spritehack.module.render;

import net.minecraft.client.MinecraftClient;
import net.minecraft.client.option.Perspective;
import net.spritehack.module.Module;

public class PerspectiveMod extends Module {

    private float cameraYaw = 0f;
    private float cameraPitch = 0f;

    public PerspectiveMod() {
        super("Perspective", "360 Freelook camera (orbit around player skin up/down/left/right)", Category.RENDER);
    }

    @Override
    public void onEnable() {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc != null && mc.player != null) {
            cameraYaw = mc.player.getYaw();
            cameraPitch = mc.player.getPitch();
            if (mc.options != null) {
                mc.options.setPerspective(Perspective.THIRD_PERSON_BACK);
            }
        }
    }

    @Override
    public void onDisable() {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc != null && mc.options != null) {
            mc.options.setPerspective(Perspective.FIRST_PERSON);
        }
    }

    public void updateCamera(double deltaX, double deltaY) {
        cameraYaw += (float) (deltaX * 0.15F);
        cameraPitch += (float) (deltaY * 0.15F);
        cameraPitch = Math.max(-89.9F, Math.min(89.9F, cameraPitch));
    }

    public float getCameraYaw() { return cameraYaw; }
    public float getCameraPitch() { return cameraPitch; }
}
