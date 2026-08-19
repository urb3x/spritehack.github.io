package net.spritehack.module.movement;

import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.attribute.EntityAttributes;
import net.spritehack.module.Module;

public class Fly extends Module {

    public float speed = 0.15f;
    public String mode = "Vanilla"; // Vanilla, Creative, Glide

    public Fly() {
        super("Flight", "Allows the player to fly freely", Category.MOVEMENT);
    }

    @Override
    public void onEnable() {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc.player == null) return;
        mc.player.getAbilities().flying = true;
        mc.player.getAbilities().allowFlying = true;
        mc.player.sendAbilitiesUpdate();
    }

    @Override
    public void onDisable() {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc.player == null) return;
        mc.player.getAbilities().allowFlying = false;
        mc.player.getAbilities().flying = false;
        mc.player.sendAbilitiesUpdate();
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null) return;
        if ("Vanilla".equals(mode)) {
            mc.player.getAbilities().setFlySpeed(speed);
        }
    }
}
