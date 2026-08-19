package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class Timer extends Module {

    public Timer() {
        super("Timer", "Accelerates client game tick speed for fast movement & mining", Category.PLAYER);
    }
}
