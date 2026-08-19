package net.spritehack.module.combat;

import net.minecraft.client.MinecraftClient;
import net.minecraft.util.Hand;
import net.minecraft.util.hit.EntityHitResult;
import net.minecraft.util.hit.HitResult;
import net.spritehack.module.Module;

import java.util.Random;

public class AutoClicker extends Module {

    private long lastClick = 0;
    private final Random random = new Random();

    public AutoClicker() {
        super("AutoClicker", "12-16 CPS randomized jitter clicker for anticheat safety", Category.COMBAT);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.interactionManager == null) return;

        if (mc.options.attackKey.isPressed()) {
            long now = System.currentTimeMillis();
            // 12-16 CPS jitter delay (60ms to 85ms)
            long delay = 60 + random.nextInt(26);
            if (now - lastClick >= delay) {
                lastClick = now;
                HitResult hit = mc.crosshairTarget;
                if (hit != null && hit.getType() == HitResult.Type.ENTITY) {
                    mc.interactionManager.attackEntity(mc.player, ((EntityHitResult) hit).getEntity());
                }
                mc.player.swingHand(Hand.MAIN_HAND);
            }
        }
    }
}
