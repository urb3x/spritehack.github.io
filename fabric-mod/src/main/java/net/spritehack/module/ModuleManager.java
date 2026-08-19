package net.spritehack.module;

import net.minecraft.client.MinecraftClient;
import net.spritehack.module.combat.*;
import net.spritehack.module.movement.*;
import net.spritehack.module.render.*;
import net.spritehack.module.player.*;
import net.spritehack.module.macros.*;

import java.util.ArrayList;
import java.util.List;

public class ModuleManager {

    private final List<Module> modules = new ArrayList<>();

    public ModuleManager() {
        // Combat
        register(new KillAura());
        register(new Aimbot());
        register(new SpinBot());
        register(new TriggerBot());
        register(new AutoCrystal());
        register(new AnchorMacro());
        register(new AutoClicker());
        register(new Reach());
        register(new Velocity());
        register(new Criticals());

        // Movement
        register(new Fly());
        register(new Speed());
        register(new HighJump());
        register(new Spider());
        register(new NoSlow());
        register(new NoFall());
        register(new Sprint());
        register(new Scaffold());
        register(new InventoryMove());
        register(new Jesus());

        // Render
        register(new XRay());
        register(new Wallhack());
        register(new Trajectories());
        register(new ChestESP());
        register(new FullBright());
        register(new ESP());
        register(new Tracers());
        register(new Freecam());
        register(new PerspectiveMod());

        // Player
        register(new Nuker());
        register(new ClickTP());
        register(new FastBreak());
        register(new FastPlace());
        register(new AutoFish());
        register(new AutoWaterBucket());
        register(new AutoEat());
        register(new AutoTotem());
        register(new AutoArmor());
        register(new Blink());
        register(new Timer());

        // Macros
        register(new BlatantMode());
        register(new BoxMacro());
        register(new SpamMacro());
    }

    private void register(Module m) { modules.add(m); }

    public void disableAll() {
        for (Module m : modules) {
            if (m.isEnabled()) m.toggle();
        }
    }

    public void onTick(MinecraftClient client) {
        for (Module m : modules) {
            if (m.isEnabled()) m.onTick(client);
        }
    }

    public List<Module> getModules() { return modules; }

    public List<Module> getModulesByCategory(Module.Category cat) {
        List<Module> result = new ArrayList<>();
        for (Module m : modules) {
            if (m.getCategory() == cat) result.add(m);
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    public <T extends Module> T getModule(Class<T> clazz) {
        for (Module m : modules) {
            if (clazz.isInstance(m)) return (T) m;
        }
        return null;
    }

    public List<Module> getEnabledModules() {
        List<Module> result = new ArrayList<>();
        for (Module m : modules) {
            if (m.isEnabled()) result.add(m);
        }
        return result;
    }
}
