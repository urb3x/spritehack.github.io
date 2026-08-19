package net.spritehack.module.movement;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class NoFall extends Module {
    public NoFall() { super("NoFall", "Prevents fall damage", Category.MOVEMENT); }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.world == null) return;
        
        // Reset fall distance on client side
        mc.player.fallDistance = 0f;

        // Spoof on-ground packet if falling to prevent fall damage calculation server-side
        if (mc.player.getVelocity().y < -0.1) {
            mc.player.onLanding();
            if (mc.player.networkHandler != null) {
                mc.player.networkHandler.sendPacket(
                    new net.minecraft.network.packet.c2s.play.PlayerMoveC2SPacket.OnGroundOnly(true)
                );
            }
        }
    }
}
