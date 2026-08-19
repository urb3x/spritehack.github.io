package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class AutoEat extends Module {

    public AutoEat() {
        super("AutoEat", "Automatically eats food when hunger drops", Category.PLAYER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.interactionManager == null) return;

        if (mc.player.getHungerManager().getFoodLevel() < 18) {
            for (int i = 0; i < 9; i++) {
                if (mc.player.getInventory().getStack(i).isFood()) {
                    mc.player.getInventory().selectedSlot = i;
                    mc.options.useKey.setPressed(true);
                    return;
                }
            }
        } else {
            mc.options.useKey.setPressed(false);
        }
    }

    @Override
    public void onDisable() {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc != null && mc.options != null) {
            mc.options.useKey.setPressed(false);
        }
    }
}
