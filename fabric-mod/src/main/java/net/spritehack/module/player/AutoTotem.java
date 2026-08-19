package net.spritehack.module.player;

import net.minecraft.client.MinecraftClient;
import net.minecraft.item.Items;
import net.minecraft.screen.slot.SlotActionType;
import net.spritehack.module.Module;

public class AutoTotem extends Module {

    public AutoTotem() {
        super("AutoTotem", "Automatically equips next Totem of Undying in offhand instantly after popping one", Category.PLAYER);
    }

    @Override
    public void onTick(MinecraftClient mc) {
        if (mc.player == null || mc.interactionManager == null) return;

        // If offhand already holds a Totem, no action needed
        if (mc.player.getOffHandStack().isOf(Items.TOTEM_OF_UNDYING)) return;

        // Find next Totem of Undying in inventory
        for (int i = 0; i < 36; i++) {
            if (mc.player.getInventory().getStack(i).isOf(Items.TOTEM_OF_UNDYING)) {
                int syncId = mc.player.currentScreenHandler.syncId;
                int slotId = (i < 9) ? i + 36 : i; // Map inventory slot to container slot index

                // Swap found totem slot into offhand (slot button 40)
                mc.interactionManager.clickSlot(
                    syncId,
                    slotId,
                    40,
                    SlotActionType.SWAP,
                    mc.player
                );
                break;
            }
        }
    }
}
