package net.spritehack.mixin;

import net.minecraft.client.network.ClientPlayerInteractionManager;
import net.minecraft.entity.player.PlayerEntity;
import net.spritehack.SpriteHackMod;
import net.spritehack.module.combat.Reach;
import net.spritehack.module.combat.SpinBot;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(ClientPlayerInteractionManager.class)
public class ClientPlayerInteractionManagerMixin {

    @Inject(method = "getReachDistance", at = @At("HEAD"), cancellable = true)
    private void onGetReachDistance(CallbackInfoReturnable<Float> cir) {
        if (SpriteHackMod.moduleManager != null) {
            Reach reachMod = SpriteHackMod.moduleManager.getModule(Reach.class);
            if (reachMod != null && reachMod.isEnabled()) {
                cir.setReturnValue((float) Reach.getReach());
            }
        }
    }

    @Inject(method = "hasExtendedReach", at = @At("HEAD"), cancellable = true)
    private void onHasExtendedReach(CallbackInfoReturnable<Boolean> cir) {
        if (SpriteHackMod.moduleManager != null) {
            Reach reachMod = SpriteHackMod.moduleManager.getModule(Reach.class);
            if (reachMod != null && reachMod.isEnabled()) {
                cir.setReturnValue(true);
            }
        }
    }

    @Inject(method = "stopUsingItem", at = @At("HEAD"))
    private void onStopUsingItem(PlayerEntity player, CallbackInfo ci) {
        if (SpriteHackMod.moduleManager == null) return;
        SpinBot spinBot = SpriteHackMod.moduleManager.getModule(SpinBot.class);
        if (spinBot != null && spinBot.isEnabled()) {
            player.setYaw(spinBot.getIntendedYaw());
            player.setPitch(spinBot.getIntendedPitch());
        }
    }
}
