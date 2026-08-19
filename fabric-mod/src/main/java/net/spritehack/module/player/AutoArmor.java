package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.minecraft.item.ArmorItem;
import net.minecraft.item.ItemStack;
import net.minecraft.screen.slot.SlotActionType;
import net.spritehack.module.Module;

public class AutoArmor extends Module {

    public AutoArmor() {
        super("AutoArmor", "Automatically equips best armor pieces from inventory", Category.PLAYER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.interactionManager == null) return;
        if (mc.currentScreen != null) return;

        for (int slot = 0; slot < 4; slot++) {
            ItemStack currentArmor = mc.player.getInventory().getArmorStack(slot);
            if (currentArmor.isEmpty()) {
                // Find matching armor in inventory
                for (int i = 9; i < 36; i++) {
                    ItemStack stack = mc.player.getInventory().getStack(i);
                    if (stack.getItem() instanceof ArmorItem armorItem) {
                        if (armorItem.getSlotType().getEntitySlotId() == slot) {
                            mc.interactionManager.clickSlot(
                                mc.player.currentScreenHandler.syncId,
                                i,
                                0,
                                SlotActionType.QUICK_MOVE,
                                mc.player
                            );
                            break;
                        }
                    }
                }
            }
        }
    }
}
