package net.spritehack.module.combat;

import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.Entity;
import net.minecraft.entity.LivingEntity;

import net.minecraft.util.hit.EntityHitResult;
import net.minecraft.util.hit.HitResult;
import net.minecraft.util.math.Box;
import net.minecraft.util.math.Vec3d;
import net.spritehack.module.Module;

import java.util.List;
import java.util.Optional;

public class Reach extends Module {

    public static float reachDistance = 4.5f;

    public Reach() {
        super("Reach", "Extended reach distance for combat (Up to 4.5m)", Category.COMBAT);
    }

    public static double getReach() {
        return reachDistance;
    }
}
