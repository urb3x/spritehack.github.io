package net.spritehack.gui;

import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.text.Text;
import net.spritehack.SpriteHackMod;
import net.spritehack.config.ConfigManager;
import net.spritehack.hud.HudRenderer;
import net.spritehack.module.Module;
import net.spritehack.module.combat.KillAura;
import net.spritehack.module.player.BoxMacro;
import net.spritehack.module.player.Nuker;
import org.lwjgl.glfw.GLFW;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SpriteHack Ultra HD Vector GUI with Default Dark Royal Purple Theme
 */
public class ClickGUI extends Screen {

    public enum ThemeColor {
        PURPLE("💜 Dark Purple"),
        RAINBOW("🌈 Rainbow"),
        CYAN("🩵 Cyan"),
        RED("❤️ Red"),
        GREEN("💚 Green"),
        AMBER("💛 Amber"),
        PINK("🩷 Pink");

        public final String display;
        ThemeColor(String display) { this.display = display; }
    }

    public static ThemeColor currentTheme = ThemeColor.PURPLE;

    private String searchQuery = "";
    private boolean searchFocused = false;
    private Module.Category selectedCategory = null;
    private Module bindingModule = null;

    private int windowX, windowY, windowW, windowH;
    private int scrollOffset = 0;

    private static final List<Module.Category> ACTIVE_CATEGORIES = Arrays.asList(
        Module.Category.COMBAT,
        Module.Category.MOVEMENT,
        Module.Category.RENDER,
        Module.Category.PLAYER,
        Module.Category.MACROS
    );

    public ClickGUI() {
        super(Text.literal("SpriteHack Ultra HD Dark Purple"));
    }

    private void updateLayout() {
        windowW = Math.min(720, (int)(this.width * 0.94));
        windowH = Math.min(460, (int)(this.height * 0.90));
        windowX = (this.width - windowW) / 2;
        windowY = (this.height - windowH) / 2;
    }

    public static int getAccentColor(int offsetIndex) {
        long time = System.currentTimeMillis();
        float mainHue = (time / 30 + (offsetIndex * 15)) % 360 / 360.0f;

        return switch (currentTheme) {
            case PURPLE  -> 0xFF6D28D9; // Sleek Dark Royal Purple
            case RAINBOW -> 0xFF000000 | (java.awt.Color.HSBtoRGB(mainHue, 0.85f, 1.0f) & 0xFFFFFF);
            case CYAN    -> 0xFF00E5FF;
            case RED     -> 0xFFEF4444;
            case GREEN   -> 0xFF10B981;
            case AMBER   -> 0xFFF59E0B;
            case PINK    -> 0xFFEC4899;
        };
    }

    public static void cycleTheme() {
        ThemeColor[] themes = ThemeColor.values();
        currentTheme = themes[(currentTheme.ordinal() + 1) % themes.length];
    }

    @Override
    protected void init() {
        updateLayout();
    }

    @Override
    public void render(DrawContext ctx, int mouseX, int mouseY, float delta) {
        updateLayout();
        int accent = getAccentColor(0);

        // 1. Dark Vignette Background
        ctx.fill(0, 0, this.width, this.height, 0x88000000);

        // 2. High-Detail Multi-Pass Drop Shadows
        for (int i = 6; i >= 1; i--) {
            int shadowAlpha = (int)(25.0f / i);
            drawRoundedPanel(ctx, windowX - i, windowY - i, windowW + (i * 2), windowH + (i * 2), shadowAlpha << 24, 0);
        }

        // 3. Main Dark Glass Container
        drawRoundedPanel(ctx, windowX, windowY, windowW, windowH, 0xF6090D16, 0xFF1E293B);

        // 4. Accent Top Gradient Line
        for (int i = 0; i < windowW - 12; i++) {
            int col = getAccentColor(i);
            ctx.fill(windowX + 6 + i, windowY, windowX + 7 + i, windowY + 2, col);
        }

        // 5. Header Title
        ctx.drawTextWithShadow(textRenderer, "⚡ SPRITEHACK", windowX + 14, windowY + 10, accent);

        // 6. Action Header Buttons
        int btnY = windowY + 7;
        int btnH = 16;
        int curX = windowX + windowW - 10;

        // Reset Binds Button
        String resetText = "🔄 Binds";
        int resetW = textRenderer.getWidth(resetText) + 10;
        curX -= resetW;
        int resetX = curX;
        curX -= 6;
        boolean hoverReset = mouseX >= resetX && mouseX <= resetX + resetW && mouseY >= btnY && mouseY <= btnY + btnH;
        drawRoundedRect(ctx, resetX, btnY, resetW, btnH, hoverReset ? 0xFFEF4444 : 0xFF1E293B);
        ctx.drawTextWithShadow(textRenderer, resetText, resetX + 5, btnY + 4, 0xFFFFFFFF);

        // HUD Stats Toggle Button
        String hudText = "📊 HUD: " + (HudRenderer.showInfoOverlay ? "ON" : "OFF");
        int hudW = textRenderer.getWidth(hudText) + 10;
        curX -= hudW;
        int hudX = curX;
        curX -= 6;
        boolean hoverHud = mouseX >= hudX && mouseX <= hudX + hudW && mouseY >= btnY && mouseY <= btnY + btnH;
        int hudBg = HudRenderer.showInfoOverlay ? (hoverHud ? accent : 0xFF1E293B) : (hoverHud ? 0xFF475569 : 0xFF1E293B);
        drawRoundedRect(ctx, hudX, btnY, hudW, btnH, hudBg);
        ctx.drawTextWithShadow(textRenderer, hudText, hudX + 5, btnY + 4, HudRenderer.showInfoOverlay ? 0xFFFFFFFF : 0xFF94A3B8);

        // Theme Color Selector Button
        String themeText = "🎨 Theme: " + currentTheme.display;
        int themeW = textRenderer.getWidth(themeText) + 10;
        curX -= themeW;
        int themeX = curX;
        curX -= 6;
        boolean hoverTheme = mouseX >= themeX && mouseX <= themeX + themeW && mouseY >= btnY && mouseY <= btnY + btnH;
        drawRoundedRect(ctx, themeX, btnY, themeW, btnH, hoverTheme ? accent : 0xFF1E293B);
        ctx.drawTextWithShadow(textRenderer, themeText, themeX + 5, btnY + 4, 0xFFFFFFFF);

        // Off All Button
        String offText = "🛑 Off All";
        int offW = textRenderer.getWidth(offText) + 10;
        curX -= offW;
        int offX = curX;
        boolean hoverOff = mouseX >= offX && mouseX <= offX + offW && mouseY >= btnY && mouseY <= btnY + btnH;
        drawRoundedRect(ctx, offX, btnY, offW, btnH, hoverOff ? 0xFFDC2626 : 0xFF1E293B);
        ctx.drawTextWithShadow(textRenderer, offText, offX + 5, btnY + 4, 0xFFFFFFFF);

        // 7. Search Input Bar
        int searchX = windowX + 12;
        int searchY = windowY + 28;
        int searchW = windowW - 24;
        int searchH = 20;
        drawRoundedRect(ctx, searchX, searchY, searchW, searchH, 0xFF131A29);
        ctx.fill(searchX + 3, searchY + searchH - 2, searchX + searchW - 3, searchY + searchH, searchFocused ? accent : 0xFF334155);

        String searchDisplay = searchQuery.isEmpty() ? "🔍 Search cheats or macros..." : "🔍 " + searchQuery;
        ctx.drawTextWithShadow(textRenderer, searchDisplay, searchX + 6, searchY + 6, searchQuery.isEmpty() ? 0xFF64748B : 0xFFFFFFFF);

        // 8. Category Navigation Bar
        int tabX = windowX + 12;
        int tabY = windowY + 52;
        int tabH = 18;

        // "📁 All" Tab
        boolean allSelected = (selectedCategory == null);
        int allW = 38;
        drawRoundedRect(ctx, tabX, tabY, allW, tabH, allSelected ? accent : 0xFF131A29);
        ctx.drawTextWithShadow(textRenderer, "📁 All", tabX + 5, tabY + 5, allSelected ? 0xFFFFFFFF : 0xFF94A3B8);
        tabX += allW + 4;

        for (int cIdx = 0; cIdx < ACTIVE_CATEGORIES.size(); cIdx++) {
            Module.Category cat = ACTIVE_CATEGORIES.get(cIdx);
            boolean sel = (selectedCategory == cat);
            String icon = getCategoryIcon(cat);
            String label = icon + " " + cat.display;
            int catW = textRenderer.getWidth(label) + 12;
            if (tabX + catW > windowX + windowW - 8) break;

            int catAccent = getAccentColor(cIdx);
            drawRoundedRect(ctx, tabX, tabY, catW, tabH, sel ? catAccent : 0xFF131A29);
            ctx.drawTextWithShadow(textRenderer, label, tabX + 6, tabY + 5, sel ? 0xFFFFFFFF : 0xFF94A3B8);
            tabX += catW + 4;
        }

        // 9. Module Row Cards Container
        int listX = windowX + 12;
        int listY = windowY + 74;
        int listW = windowW - 24;
        int listH = windowH - 86;

        drawRoundedRect(ctx, listX, listY, listW, listH, 0xFF05080E);

        List<Module> allMods = SpriteHackMod.moduleManager.getModules();
        List<Module> filteredMods = allMods.stream()
            .filter(m -> selectedCategory == null || m.getCategory() == selectedCategory)
            .filter(m -> searchQuery.isEmpty() || m.getName().toLowerCase().contains(searchQuery.toLowerCase()) || m.getDescription().toLowerCase().contains(searchQuery.toLowerCase()))
            .collect(Collectors.toList());

        int modY = listY + 4 - scrollOffset;

        for (int i = 0; i < filteredMods.size(); i++) {
            Module mod = filteredMods.get(i);
            if (modY >= listY && modY + 20 <= listY + listH) {
                boolean hoveredRow = mouseX >= listX && mouseX <= listX + listW && mouseY >= modY && mouseY <= modY + 20;
                boolean on = mod.isEnabled();
                int rowAccent = getAccentColor(i);

                int rowBg = on ? 0xFF172033 : (hoveredRow ? 0xFF172033 : 0xFF0B101D);
                drawRoundedRect(ctx, listX + 3, modY, listW - 6, 20, rowBg);
                if (on) ctx.fill(listX + 3, modY, listX + 6, modY + 20, rowAccent);

                // High-Detail Checkbox Box at listX + 10
                int chkX = listX + 10;
                int chkY = modY + 3;
                int chkW = 14;
                int chkH = 14;
                boolean hoverChk = mouseX >= chkX && mouseX <= chkX + chkW && mouseY >= chkY && mouseY <= chkY + chkH;
                drawRoundedRect(ctx, chkX, chkY, chkW, chkH, on ? rowAccent : (hoverChk ? 0xFF334155 : 0xFF1E293B));
                String checkText = on ? "✔" : "✖";
                ctx.drawTextWithShadow(textRenderer, checkText, chkX + 3, chkY + 3, on ? 0xFFFFFFFF : 0xFF64748B);

                // Cheat Name & Mode / Keybind status
                boolean isBinding = (bindingModule == mod);
                String nameText = mod.getName();

                if (mod instanceof KillAura ka) {
                    nameText += " [" + ka.targetMode.display + "]";
                } else if (mod instanceof Nuker nuker) {
                    nameText += " [" + nuker.mode.display + "]";
                }

                if (isBinding) {
                    ctx.drawTextWithShadow(textRenderer, nameText + " [PRESS KEY...]", listX + 28, modY + 6, rowAccent);
                } else {
                    if (mod.getKeyBind() > 0) {
                        String keyName = GLFW.glfwGetKeyName(mod.getKeyBind(), 0);
                        if (keyName == null) keyName = "K" + mod.getKeyBind();
                        nameText += " (" + keyName.toUpperCase() + ")";
                    }
                    ctx.drawTextWithShadow(textRenderer, nameText, listX + 28, modY + 6, on ? 0xFFFFFFFF : 0xFF94A3B8);
                }

                // Dynamic description truncation to prevent clipping
                String desc = mod.getDescription();
                int nameW = textRenderer.getWidth(nameText);
                int maxDescW = listW - (32 + nameW + 20);
                if (maxDescW > 40) {
                    if (textRenderer.getWidth(desc) > maxDescW) {
                        while (desc.length() > 5 && textRenderer.getWidth(desc + "...") > maxDescW) {
                            desc = desc.substring(0, desc.length() - 1);
                        }
                        desc += "...";
                    }
                    ctx.drawTextWithShadow(textRenderer, desc, listX + listW - textRenderer.getWidth(desc) - 8, modY + 6, 0xFF64748B);
                }
            }
            modY += 22;
        }

        String tip = "Left-Click Checkbox: Toggle | Right-Click Mode: Cycle Mode | Click Name: Bind Key";
        ctx.drawTextWithShadow(textRenderer, tip, windowX + (windowW - textRenderer.getWidth(tip)) / 2, windowY + windowH - 10, 0xFF64748B);
    }

    @Override
    public boolean mouseClicked(double mouseX, double mouseY, int button) {
        updateLayout();
        int mx = (int) mouseX, my = (int) mouseY;

        // Search bar focus
        int searchX = windowX + 12;
        int searchY = windowY + 28;
        int searchW = windowW - 24;
        int searchH = 20;
        searchFocused = mx >= searchX && mx <= searchX + searchW && my >= searchY && my <= searchY + searchH;

        int btnY = windowY + 7;
        int btnH = 16;
        int curX = windowX + windowW - 10;

        // Reset Binds Button
        String resetText = "🔄 Binds";
        int resetW = textRenderer.getWidth(resetText) + 10;
        curX -= resetW;
        int resetX = curX;
        curX -= 6;
        if (mx >= resetX && mx <= resetX + resetW && my >= btnY && my <= btnY + btnH) {
            bindingModule = null;
            ConfigManager.resetBinds();
            return true;
        }

        // HUD Stats Toggle Button
        String hudText = "📊 HUD: " + (HudRenderer.showInfoOverlay ? "ON" : "OFF");
        int hudW = textRenderer.getWidth(hudText) + 10;
        curX -= hudW;
        int hudX = curX;
        curX -= 6;
        if (mx >= hudX && mx <= hudX + hudW && my >= btnY && my <= btnY + btnH) {
            bindingModule = null;
            HudRenderer.showInfoOverlay = !HudRenderer.showInfoOverlay;
            return true;
        }

        // Theme Color Selector Button
        String themeText = "🎨 Theme: " + currentTheme.display;
        int themeW = textRenderer.getWidth(themeText) + 10;
        curX -= themeW;
        int themeX = curX;
        curX -= 6;
        if (mx >= themeX && mx <= themeX + themeW && my >= btnY && my <= btnY + btnH) {
            bindingModule = null;
            cycleTheme();
            return true;
        }

        // Off All Button
        String offText = "🛑 Off All";
        int offW = textRenderer.getWidth(offText) + 10;
        curX -= offW;
        int offX = curX;
        if (mx >= offX && mx <= offX + offW && my >= btnY && my <= btnY + btnH) {
            bindingModule = null;
            SpriteHackMod.moduleManager.disableAll();
            return true;
        }

        // Category navigation tabs
        int tabX = windowX + 12;
        int tabY = windowY + 52;
        int tabH = 18;

        int allW = 38;
        if (mx >= tabX && mx <= tabX + allW && my >= tabY && my <= tabY + tabH) {
            bindingModule = null;
            selectedCategory = null;
            searchQuery = "";
            scrollOffset = 0;
            return true;
        }
        tabX += allW + 4;

        for (Module.Category cat : ACTIVE_CATEGORIES) {
            String label = getCategoryIcon(cat) + " " + cat.display;
            int catW = textRenderer.getWidth(label) + 12;
            if (tabX + catW > windowX + windowW - 8) break;

            if (mx >= tabX && mx <= tabX + catW && my >= tabY && my <= tabY + tabH) {
                bindingModule = null;
                selectedCategory = cat;
                searchQuery = "";
                scrollOffset = 0;
                return true;
            }
            tabX += catW + 4;
        }

        // Module row clicks
        int listX = windowX + 12;
        int listY = windowY + 74;
        int listW = windowW - 24;
        int listH = windowH - 86;

        List<Module> allMods = SpriteHackMod.moduleManager.getModules();
        List<Module> filteredMods = allMods.stream()
            .filter(m -> selectedCategory == null || m.getCategory() == selectedCategory)
            .filter(m -> searchQuery.isEmpty() || m.getName().toLowerCase().contains(searchQuery.toLowerCase()) || m.getDescription().toLowerCase().contains(searchQuery.toLowerCase()))
            .collect(Collectors.toList());

        int modY = listY + 4 - scrollOffset;

        for (Module mod : filteredMods) {
            if (modY >= listY && modY + 20 <= listY + listH) {
                if (my >= modY && my <= modY + 20) {
                    int chkX = listX + 10;
                    int chkW = 14;

                    if (mx >= chkX - 4 && mx <= chkX + chkW + 4) {
                        bindingModule = null;
                        if (button == 0) {
                            mod.toggle();
                        } else if (button == 1 && mod instanceof BoxMacro) {
                            BoxMacro.cycleSize();
                        }
                        return true;
                    } else if (mx > chkX + chkW + 4 && mx <= listX + listW) {
                        if (button == 1 && mod instanceof KillAura ka) {
                            ka.cycleTargetMode();
                            return true;
                        } else if (button == 1 && mod instanceof Nuker nuker) {
                            nuker.cycleMode();
                            return true;
                        }
                        bindingModule = mod;
                        searchFocused = false;
                        return true;
                    }
                }
            }
            modY += 22;
        }

        bindingModule = null;
        return super.mouseClicked(mouseX, mouseY, button);
    }

    @Override
    public boolean charTyped(char chr, int modifiers) {
        if (bindingModule != null || !searchFocused) {
            return true;
        }
        searchQuery += chr;
        return true;
    }

    @Override
    public boolean keyPressed(int keyCode, int scanCode, int modifiers) {
        if (bindingModule != null) {
            if (keyCode == GLFW.GLFW_KEY_ESCAPE) {
                bindingModule = null;
                return true;
            } else if (keyCode == GLFW.GLFW_KEY_DELETE || keyCode == GLFW.GLFW_KEY_BACKSPACE) {
                bindingModule.setKeyBind(-1);
            } else if (keyCode != GLFW.GLFW_KEY_UNKNOWN) {
                bindingModule.setKeyBind(keyCode);
            }
            ConfigManager.saveBinds();
            bindingModule = null;
            return true;
        }

        if (keyCode == GLFW.GLFW_KEY_ESCAPE || keyCode == GLFW.GLFW_KEY_RIGHT_SHIFT) {
            this.close();
            return true;
        }

        if (searchFocused && keyCode == GLFW.GLFW_KEY_BACKSPACE) {
            if (!searchQuery.isEmpty()) {
                searchQuery = searchQuery.substring(0, searchQuery.length() - 1);
            }
            return true;
        }

        return super.keyPressed(keyCode, scanCode, modifiers);
    }

    @Override
    public boolean mouseScrolled(double mouseX, double mouseY, double horizontalAmount, double verticalAmount) {
        scrollOffset = Math.max(0, scrollOffset - (int)(verticalAmount * 15));
        return true;
    }

    public void close() {
        ConfigManager.saveBinds();
        if (this.client != null) this.client.setScreen(null);
    }

    @Override
    public boolean shouldPause() { return false; }

    private String getCategoryIcon(Module.Category cat) {
        return switch (cat) {
            case COMBAT   -> "⚔️";
            case MOVEMENT -> "🏃";
            case RENDER   -> "👁️";
            case PLAYER   -> "👤";
            case MACROS   -> "⚡";
            case CLIENT   -> "⚙️";
        };
    }

    private static void drawRoundedRect(DrawContext ctx, int x, int y, int w, int h, int color) {
        ctx.fill(x + 2, y, x + w - 2, y + h, color);
        ctx.fill(x, y + 2, x + w, y + h - 2, color);
        ctx.fill(x + 1, y + 1, x + w - 1, y + h - 1, color);
    }

    private static void drawRoundedPanel(DrawContext ctx, int x, int y, int w, int h, int bg, int border) {
        if (border != 0) {
            drawRoundedRect(ctx, x - 1, y - 1, w + 2, h + 2, border);
        }
        drawRoundedRect(ctx, x, y, w, h, bg);
    }
}
