package net.spritehack.module.render;

import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.Entity;
import net.minecraft.entity.player.PlayerEntity;
import net.spritehack.module.Module;

public class Tracers extends Module {

    public Tracers() {
        super("Tracers", "Highlight and track players across the map", Category.RENDER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.world == null || mc.player == null) return;

        for (Entity e : mc.world.getEntities()) {
            if (e instanceof PlayerEntity && e != mc.player) {
                e.setGlowing(true);
            }
        }
    }

    @Override
    public void onDisable() {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc != null && mc.world != null) {
            for (Entity e : mc.world.getEntities()) {
                if (e != mc.player) {
                    e.setGlowing(false);
                }
            }
        }
    }
}
