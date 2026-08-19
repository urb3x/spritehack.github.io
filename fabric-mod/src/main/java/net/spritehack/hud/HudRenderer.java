package net.spritehack.hud;

import net.minecraft.client.font.TextRenderer;
import net.minecraft.client.gui.DrawContext;
import net.spritehack.SpriteHackMod;
import net.spritehack.gui.ClickGUI;
import net.spritehack.module.Module;
import net.spritehack.module.render.Trajectories;

import java.util.Comparator;
import java.util.List;

public class HudRenderer {

    public static boolean showInfoOverlay = true; // Toggle for bottom-left FPS, Ping, Coordinates & Direction

    public static void render(DrawContext ctx, float tickDelta) {
        net.minecraft.client.MinecraftClient mc = net.minecraft.client.MinecraftClient.getInstance();
        if (mc.player == null) return;
        TextRenderer tr = mc.textRenderer;

        int accent = ClickGUI.getAccentColor(0);

        // 1. Top-Left Watermark ("⚡ SpriteHack")
        String title = "⚡ SpriteHack";
        int badgeW = tr.getWidth(title) + 12;
        ctx.fill(4, 4, 4 + badgeW, 22, 0xD00B0E17);
        ctx.fill(4, 20, 4 + badgeW, 22, accent);
        ctx.drawTextWithShadow(tr, title, 8, 8, accent);

        // 2. Info Overlay (FPS, Ping, Coordinates, Facing Direction) - Toggleable!
        if (showInfoOverlay) {
            int fps = mc.getCurrentFps();
            int ping = 0;
            if (mc.getNetworkHandler() != null && mc.getNetworkHandler().getPlayerListEntry(mc.player.getUuid()) != null) {
                ping = mc.getNetworkHandler().getPlayerListEntry(mc.player.getUuid()).getLatency();
            }

            String facing = mc.player.getHorizontalFacing().getName().toUpperCase();
            String coords = String.format("XYZ: %.1f / %.1f / %.1f [%s]", mc.player.getX(), mc.player.getY(), mc.player.getZ(), facing);
            String stats = String.format("FPS: %d  |  Ping: %dms", fps, ping);

            int bottomY = ctx.getScaledWindowHeight() - 14;
            ctx.fill(4, bottomY - 14, tr.getWidth(coords) + 12, ctx.getScaledWindowHeight() - 2, 0xD00B0E17);
            ctx.drawTextWithShadow(tr, stats, 8, bottomY - 12, 0xFF888888);
            ctx.drawTextWithShadow(tr, coords, 8, bottomY - 2, accent);
        }

        // 3. Render Trajectories flight path & landing block highlight if enabled
        Trajectories trajectories = SpriteHackMod.moduleManager.getModule(Trajectories.class);
        if (trajectories != null && trajectories.isEnabled()) {
            Trajectories.renderHUD(ctx, tr);
        }

        // 4. Top-Right ArrayList (Uses selected accent theme color)
        List<Module> activeMods = SpriteHackMod.moduleManager.getEnabledModules();
        activeMods.sort(Comparator.comparingInt(m -> -tr.getWidth(m.getName())));

        int y = 6;

        for (int i = 0; i < activeMods.size(); i++) {
            Module mod = activeMods.get(i);
            String name = mod.getName();
            int w = tr.getWidth(name);
            int x = ctx.getScaledWindowWidth() - w - 10;

            int modAccent = ClickGUI.getAccentColor(i);

            ctx.fill(x - 4, y - 2, ctx.getScaledWindowWidth(), y + 12, 0xD00D111A);
            ctx.fill(ctx.getScaledWindowWidth() - 3, y - 2, ctx.getScaledWindowWidth(), y + 12, modAccent);

            ctx.drawTextWithShadow(tr, name, x, y, modAccent);
            y += 14;
        }
    }
}
