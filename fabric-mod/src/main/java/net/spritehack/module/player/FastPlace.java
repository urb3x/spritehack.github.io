package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class FastPlace extends Module {

    public FastPlace() {
        super("FastPlace", "Eliminates block placement delay for rapid building", Category.PLAYER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc != null) {
            try {
                java.lang.reflect.Field field = MinecraftClient.class.getDeclaredField("itemUseCooldown");
                field.setAccessible(true);
                field.setInt(mc, 0);
            } catch (Exception ignored) {}
        }
    }
}
