package net.spritehack.mixin;

import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.util.math.Vec3d;
import net.spritehack.SpriteHackMod;
import net.spritehack.module.combat.SpinBot;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(PlayerEntity.class)
public class PlayerEntityTravelMixin {

    @Inject(method = "travel", at = @At("HEAD"))
    private void onTravelHead(Vec3d movementInput, CallbackInfo ci) {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc != null && (Object) this == mc.player && SpriteHackMod.moduleManager != null) {
            SpinBot spinBot = SpriteHackMod.moduleManager.getModule(SpinBot.class);
            if (spinBot != null && spinBot.isEnabled()) {
                spinBot.beforeTravel((PlayerEntity) (Object) this);
            }
        }
    }

    @Inject(method = "travel", at = @At("TAIL"))
    private void onTravelTail(Vec3d movementInput, CallbackInfo ci) {
        MinecraftClient mc = MinecraftClient.getInstance();
        if (mc != null && (Object) this == mc.player && SpriteHackMod.moduleManager != null) {
            SpinBot spinBot = SpriteHackMod.moduleManager.getModule(SpinBot.class);
            if (spinBot != null && spinBot.isEnabled()) {
                spinBot.afterTravel((PlayerEntity) (Object) this);
            }
        }
    }
}
