package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class SpamMacro extends Module {

    private int timer = 0;
    public String message = "⚡ SpriteHack is on top";

    public SpamMacro() {
        super("SpamMacro", "Auto chat spammer macro", Category.MACROS);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.getNetworkHandler() == null) return;

        timer++;
        if (timer >= 60) { // Every 3 seconds
            mc.getNetworkHandler().sendChatMessage(message + " [" + (int)(Math.random() * 1000) + "]");
            timer = 0;
        }
    }
}
