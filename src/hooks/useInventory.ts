import { useState, useCallback } from "react";
import {
  Inventory,
  Resource,
  Block,
  Tool,
  Consumable,
  PlayerData,
  Player,
} from "../models/Player";
import { ConsumableStats } from "../config/consumablesConfig";
import {
  getAvailableBlocks,
  handleBlockCraft,
  handleEquip,
  canCraftRecipe,
  getFilteredRecipes,
  canCraftBlock,
} from "../utils/inventoryUtils";
import { handleConsumableCraft } from "../utils/consumableUtils";

// Inventory hook module loading logging | used for debugging module initialization
console.log("🎒 Inventory hook module loaded");

// Inventory hook props interface | used to define the expected props for the useInventory hook
interface UseInventoryProps {
  inventory: Inventory;
  onInventoryChange: (newInventory: Inventory) => void;
  player: Player;
  onPlayerChange: (newPlayer: Player) => void;
}

// Main Inventory custom hook | used to manage all inventory state and logic in a centralized location
export const useInventory = ({
  inventory,
  onInventoryChange,
  player,
  onPlayerChange,
}: UseInventoryProps) => {
  // Equipment type selection state | used to track whether player is selecting pickaxe or block equipment
  const [selectedType, setSelectedType] = useState<"pickaxe" | "block">(
    "pickaxe"
  );
  // Consumable type selection state | used to track which type of consumable recipes to display
  const [selectedConsumableType, setSelectedConsumableType] =
    useState<ConsumableStats>(ConsumableStats.HEALTH);

  // Available blocks computation | used to determine which blocks the player can equip
  const availableBlocks = getAvailableBlocks(inventory);

  // Block crafting callback | used to handle block crafting with memoization for performance
  const handleBlockCraftCallback = useCallback(
    (material: keyof Resource) => {
      handleBlockCraft(inventory, material, onInventoryChange);
    },
    [inventory, onInventoryChange]
  );

  // Equipment callback | used to handle equipping items with memoization for performance
  const handleEquipCallback = useCallback(
    (item: Tool | Block) => {
      handleEquip(inventory, item, selectedType, onInventoryChange);
    },
    [inventory, selectedType, onInventoryChange]
  );

  // Consumable crafting callback | used to handle consumable crafting with memoization for performance
  const handleConsumableCraftCallback = useCallback(
    (recipe: any) => {
      handleConsumableCraft(recipe, inventory, onInventoryChange);
    },
    [inventory, onInventoryChange]
  );

  // Consumable use callback | used to handle using consumables with memoization for performance
  const handleConsumableUseCallback = useCallback(
    (consumable: Consumable) => {
      const newPlayer = player.useConsumable(consumable);
      onPlayerChange(newPlayer);
    },
    [player, onPlayerChange]
  );

  // Recipe crafting validation callback | used to check if a recipe can be crafted with memoization
  const canCraftRecipeCallback = useCallback(
    (recipe: any) => {
      return canCraftRecipe(recipe, inventory);
    },
    [inventory]
  );

  // Filtered recipes callback | used to get recipes filtered by selected type with memoization
  const getFilteredRecipesCallback = useCallback(() => {
    return getFilteredRecipes(selectedConsumableType);
  }, [selectedConsumableType]);

  // Block crafting validation callback | used to check if a block can be crafted with memoization
  const canCraftBlockCallback = useCallback(
    (material: keyof Resource) => {
      return canCraftBlock(material, inventory);
    },
    [inventory]
  );

  // Hook return object | used to expose all state and handlers to the component using this hook
  return {
    selectedType,
    setSelectedType,
    selectedConsumableType,
    setSelectedConsumableType,
    availableBlocks,
    handleBlockCraft: handleBlockCraftCallback,
    handleEquip: handleEquipCallback,
    handleConsumableCraft: handleConsumableCraftCallback,
    handleConsumableUse: handleConsumableUseCallback,
    canCraftRecipe: canCraftRecipeCallback,
    getFilteredRecipes: getFilteredRecipesCallback,
    canCraftBlock: canCraftBlockCallback,
  };
};
