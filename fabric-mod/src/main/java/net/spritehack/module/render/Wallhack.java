package net.spritehack.module.render;

import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.Entity;
import net.minecraft.entity.LivingEntity;
import net.spritehack.module.Module;

public class Wallhack extends Module {

    public Wallhack() {
        super("Wallhack", "See all players and mobs through walls (Chams)", Category.RENDER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.world == null || mc.player == null) return;

        for (Entity e : mc.world.getEntities()) {
            if (e instanceof LivingEntity && e != mc.player) {
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
