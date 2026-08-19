package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class Blink extends Module {

    public Blink() {
        super("Blink", "Simulates network lag and teleports movement packets on disable", Category.PLAYER);
    }
}
