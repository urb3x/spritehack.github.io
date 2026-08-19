package net.spritehack.module.movement;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class NoSlow extends Module {

    public NoSlow() {
        super("NoSlow", "Prevents movement slowdown while eating or using items", Category.MOVEMENT);
    }
}
