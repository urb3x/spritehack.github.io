package net.spritehack.module.combat;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.Module;

public class SpinBot extends Module {

    private float spinYaw = 0.0f;
    private float intendedYaw = 0.0f;
    private float intendedPitch = 0.0f;

    public SpinBot() {
        super("SpinBot", "Ultra-fast 360 anti-aim spinning (Camera stays normal, player skin spins)", Category.COMBAT);
    }

    @Override
    public void onEnable() {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc != null && mc.player != null) {
            intendedYaw = mc.player.getYaw();
            intendedPitch = mc.player.getPitch();
        }
    }

    public void updateLook(double deltaX, double deltaY) {
        intendedYaw += (float) (deltaX * 0.15F);
        intendedPitch += (float) (deltaY * 0.15F);
        intendedPitch = Math.max(-90.0F, Math.min(90.0F, intendedPitch));
    }

    public void beforeTravel(net.minecraft.entity.Entity player) {
        player.setYaw(intendedYaw);
    }

    public void afterTravel(net.minecraft.entity.Entity player) {
        player.setYaw(spinYaw);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null) return;

        // Ultra-fast spin increment
        spinYaw += 120.0f;
        if (spinYaw >= 360.0f) spinYaw -= 360.0f;

        // Spin head and body model so you see your skin spinning in 3rd person
        mc.player.setHeadYaw(spinYaw);
        mc.player.setBodyYaw(spinYaw);

        // Keep camera look yaw & pitch at intended angle so screen NEVER spins in 1st or 3rd person!
        mc.player.setYaw(intendedYaw);
        mc.player.setPitch(intendedPitch);
    }

    public float getIntendedYaw() { return intendedYaw; }
    public float getIntendedPitch() { return intendedPitch; }
    public float getSpinYaw() { return spinYaw; }
}
