package net.spritehack.module.render;

import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.Entity;
import net.minecraft.entity.LivingEntity;
import net.minecraft.entity.player.PlayerEntity;
import net.spritehack.module.Module;

public class ESP extends Module {
    public boolean players = true;
    public boolean mobs = true;

    public ESP() {
        super("ESP", "Glowing 3D outline box around entities through walls", Category.RENDER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.world == null || mc.player == null) return;

        for (Entity e : mc.world.getEntities()) {
            if (!(e instanceof LivingEntity living)) continue;
            if (e == mc.player) continue;

            if ((players && e instanceof PlayerEntity) || (mobs && !(e instanceof PlayerEntity))) {
                living.setGlowing(true);
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
