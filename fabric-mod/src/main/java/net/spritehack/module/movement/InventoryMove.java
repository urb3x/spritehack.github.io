package net.spritehack.module.movement;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class InventoryMove extends Module {

    public InventoryMove() {
        super("InvMove", "Allows moving freely while in inventory screens", Category.MOVEMENT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.currentScreen != null && !(mc.currentScreen instanceof net.minecraft.client.gui.screen.ChatScreen)) {
            mc.options.forwardKey.setPressed(net.minecraft.client.util.InputUtil.isKeyPressed(mc.getWindow().getHandle(), mc.options.forwardKey.getDefaultKey().getCode()));
            mc.options.backKey.setPressed(net.minecraft.client.util.InputUtil.isKeyPressed(mc.getWindow().getHandle(), mc.options.backKey.getDefaultKey().getCode()));
            mc.options.leftKey.setPressed(net.minecraft.client.util.InputUtil.isKeyPressed(mc.getWindow().getHandle(), mc.options.leftKey.getDefaultKey().getCode()));
            mc.options.rightKey.setPressed(net.minecraft.client.util.InputUtil.isKeyPressed(mc.getWindow().getHandle(), mc.options.rightKey.getDefaultKey().getCode()));
            mc.options.jumpKey.setPressed(net.minecraft.client.util.InputUtil.isKeyPressed(mc.getWindow().getHandle(), mc.options.jumpKey.getDefaultKey().getCode()));
        }
    }
}
