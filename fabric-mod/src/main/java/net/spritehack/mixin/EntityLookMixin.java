package net.spritehack.mixin;

import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.Entity;
import net.spritehack.SpriteHackMod;
import net.spritehack.module.combat.SpinBot;
import net.spritehack.module.render.Freecam;
import net.spritehack.module.render.PerspectiveMod;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(Entity.class)
public class EntityLookMixin {

    @Inject(method = "changeLookDirection", at = @At("HEAD"), cancellable = true)
    private void onChangeLookDirection(double cursorDeltaX, double cursorDeltaY, CallbackInfo ci) {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc == null || (Object) this != mc.player || SpriteHackMod.moduleManager == null) return;

        PerspectiveMod perspective = SpriteHackMod.moduleManager.getModule(PerspectiveMod.class);
        if (perspective != null && perspective.isEnabled()) {
            perspective.updateCamera(cursorDeltaX, cursorDeltaY);
            ci.cancel();
            return;
        }

        Freecam freecam = SpriteHackMod.moduleManager.getModule(Freecam.class);
        if (freecam != null && freecam.isEnabled()) {
            freecam.updateCamera(cursorDeltaX, cursorDeltaY);
            ci.cancel();
            return;
        }

        SpinBot spinBot = SpriteHackMod.moduleManager.getModule(SpinBot.class);
        if (spinBot != null && spinBot.isEnabled()) {
            spinBot.updateLook(cursorDeltaX, cursorDeltaY);
            ci.cancel();
            return;
        }
    }
}
