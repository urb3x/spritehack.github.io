package net.spritehack.mixin;

import net.minecraft.entity.Entity;
import net.spritehack.SpriteHackMod;
import net.spritehack.module.render.ESP;
import net.spritehack.module.render.Wallhack;
import net.spritehack.module.render.Tracers;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(Entity.class)
public class EntityMixin {

    @Inject(method = "isGlowing", at = @At("HEAD"), cancellable = true)
    private void onIsGlowing(CallbackInfoReturnable<Boolean> cir) {
        if (SpriteHackMod.moduleManager != null) {
            ESP esp = SpriteHackMod.moduleManager.getModule(ESP.class);
            Wallhack wallhack = SpriteHackMod.moduleManager.getModule(Wallhack.class);
            Tracers tracers = SpriteHackMod.moduleManager.getModule(Tracers.class);

            if ((esp != null && esp.isEnabled()) || 
                (wallhack != null && wallhack.isEnabled()) || 
                (tracers != null && tracers.isEnabled())) {
                cir.setReturnValue(true);
            }
        }
    }
}
