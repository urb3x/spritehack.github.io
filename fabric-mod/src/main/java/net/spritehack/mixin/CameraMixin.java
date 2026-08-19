package net.spritehack.mixin;

import net.minecraft.client.render.Camera;
import net.minecraft.entity.Entity;
import net.minecraft.util.math.Vec3d;
import net.minecraft.world.BlockView;
import net.spritehack.SpriteHackMod;
import net.spritehack.module.render.Freecam;
import net.spritehack.module.render.PerspectiveMod;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(Camera.class)
public abstract class CameraMixin {

    @Shadow
    protected abstract void setRotation(float yaw, float pitch);

    @Shadow
    protected abstract void setPos(double x, double y, double z);

    @Inject(method = "update", at = @At("TAIL"))
    private void onCameraUpdate(BlockView area, Entity focusedEntity, boolean thirdPerson, boolean inverseView, float tickDelta, CallbackInfo ci) {
        if (SpriteHackMod.moduleManager == null || focusedEntity == null) return;

        PerspectiveMod perspective = SpriteHackMod.moduleManager.getModule(PerspectiveMod.class);
        if (perspective != null && perspective.isEnabled()) {
            float yaw = perspective.getCameraYaw();
            float pitch = perspective.getCameraPitch();
            double distance = 4.0;

            Vec3d eyePos = focusedEntity.getEyePos();
            double radYaw = Math.toRadians(yaw);
            double radPitch = Math.toRadians(pitch);

            double camX = eyePos.x + (Math.sin(radYaw) * Math.cos(radPitch) * distance);
            double camY = eyePos.y + (Math.sin(radPitch) * distance);
            double camZ = eyePos.z + (-Math.cos(radYaw) * Math.cos(radPitch) * distance);

            this.setPos(camX, camY, camZ);
            this.setRotation(yaw, pitch);
        }

        Freecam freecam = SpriteHackMod.moduleManager.getModule(Freecam.class);
        if (freecam != null && freecam.isEnabled()) {
            this.setRotation(freecam.getCameraYaw(), freecam.getCameraPitch());
            this.setPos(freecam.getFreecamX(), freecam.getFreecamY(), freecam.getFreecamZ());
        }
    }
}
