package net.spritehack.module.combat;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class Criticals extends Module {

    public Criticals() {
        super("Criticals", "Always hit critical strikes", Category.COMBAT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.world == null) return;
        if (mc.player.isSubmergedInWater() || mc.player.isInLava()) return;
        
        // Micro-hop packet when attacking on ground to force critical strike
        if (mc.options.attackKey.isPressed() && mc.player.isOnGround()) {
            if (mc.player.networkHandler != null) {
                double x = mc.player.getX();
                double y = mc.player.getY();
                double z = mc.player.getZ();
                mc.player.networkHandler.sendPacket(new net.minecraft.network.packet.c2s.play.PlayerMoveC2SPacket.PositionAndOnGround(x, y + 0.0625, z, false));
                mc.player.networkHandler.sendPacket(new net.minecraft.network.packet.c2s.play.PlayerMoveC2SPacket.PositionAndOnGround(x, y, z, false));
            }
        }
    }
}
