package net.spritehack.module.render;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class ChestESP extends Module {

    public ChestESP() {
        super("ChestESP", "Highlights containers, chests, barrels, and shulker boxes", Category.RENDER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
    }
}
