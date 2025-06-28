import React from "react";
import { Inventory, Player } from "../../models/Player";
import "./Inventory.css";
import { useInventory } from "../../hooks/useInventory";
import {
  ResourcesSection,
  BlocksSection,
  ConsumablesSection,
  EquippedSection,
} from "./InventorySections";

interface InventoryWindowProps {
  inventory: Inventory;
  onInventoryChange: (newInventory: Inventory) => void;
  player: Player;
  onPlayerChange: (newPlayer: Player) => void;
}

export const InventoryWindow: React.FC<InventoryWindowProps> = ({
  inventory,
  onInventoryChange,
  player,
  onPlayerChange,
}) => {
  const {
    selectedType,
    setSelectedType,
    selectedConsumableType,
    setSelectedConsumableType,
    availableBlocks,
    handleBlockCraft,
    handleEquip,
    handleConsumableCraft,
    handleConsumableUse,
    canCraftRecipe,
    getFilteredRecipes,
  } = useInventory({
    inventory,
    onInventoryChange,
    player,
    onPlayerChange,
  });

  return (
    <div className="inventory-container">
      <ResourcesSection inventory={inventory} />

      <BlocksSection inventory={inventory} onBlockCraft={handleBlockCraft} />

      <ConsumablesSection
        inventory={inventory}
        selectedConsumableType={selectedConsumableType}
        onConsumableTypeChange={setSelectedConsumableType}
        onConsumableCraft={handleConsumableCraft}
        onConsumableUse={handleConsumableUse}
        canCraftRecipe={canCraftRecipe}
        getFilteredRecipes={getFilteredRecipes}
      />

      <EquippedSection
        inventory={inventory}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        availableBlocks={availableBlocks}
        onEquip={handleEquip}
      />
    </div>
  );
};
