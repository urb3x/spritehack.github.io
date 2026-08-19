package net.spritehack.module.render;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class XRay extends Module {

    public XRay() {
        super("XRay", "Highlights ores, diamonds, netherite, and chests through blocks", Category.RENDER);
    }

    @Override
    public void onEnable() {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc.worldRenderer != null) {
            mc.worldRenderer.reload();
        }
    }

    @Override
    public void onDisable() {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc != null && mc.worldRenderer != null) {
            mc.worldRenderer.reload();
        }
    }
}
