import {
  Inventory,
  Resource,
  Block,
  Tool,
  Consumable,
  Player,
} from "../types/player";
import {
  ConsumableStats,
  consumableRecipes,
} from "../config/consumablesConfig";

// Inventory utilities module loading logging | used for debugging module initialization
console.log("🎒 Inventory utilities module loaded");

// Available blocks getter function | used to extract list of blocks that player has in their inventory
export const getAvailableBlocks = (inventory: Inventory): string[] => {
  return inventory.blocks
    ? Object.entries(inventory.blocks)
        .filter(([_, value]) => value && value > 0)
        .map(([key]) => key.replace("Block", ""))
    : [];
};

// Block crafting handler function | used to convert 9 resources into 1 block and update inventory
export const handleBlockCraft = (
  inventory: Inventory,
  material: keyof Resource,
  onInventoryChange: (newInventory: Inventory) => void
) => {
  if (!inventory.resources || !inventory.blocks) return;

  // Resource and block state copying | used to create mutable copies of current inventory state
  const newResources = { ...inventory.resources };
  const newBlocks = { ...inventory.blocks };

  // Resource consumption and block creation | used to subtract 9 resources and add 1 block
  newResources[material] -= 9;
  const blockKey = `${material}Block` as keyof Block;
  newBlocks[blockKey] = (newBlocks[blockKey] || 0) + 1;

  // Inventory update | used to create new inventory object with updated resources and blocks
  const newInventory = {
    ...inventory,
    resources: newResources,
    blocks: newBlocks,
  };

  onInventoryChange(newInventory);
};

// Equipment handler function | used to equip items (pickaxe or block) and update inventory
export const handleEquip = (
  inventory: Inventory,
  item: Tool | Block,
  selectedType: "pickaxe" | "block",
  onInventoryChange: (newInventory: Inventory) => void
) => {
  // Block equipment logic | used to equip a block when block type is selected
  if (selectedType === "block") {
    const newInventory = {
      ...inventory,
      equiped: {
        block: item as Block,
      },
    };
    onInventoryChange(newInventory);
  }
  // Pickaxe equipment logic | used to equip a pickaxe when pickaxe type is selected
  if (selectedType === "pickaxe") {
    const newInventory = {
      ...inventory,
      equiped: { pickaxe: item as Tool },
    };
    onInventoryChange(newInventory);
  }
  console.log(`Equipping ${item} of type ${selectedType}`);
};

// Recipe crafting validation function | used to check if player has enough resources to craft a recipe
export const canCraftRecipe = (
  recipe: (typeof consumableRecipes)[0],
  inventory: Inventory
): boolean => {
  if (!inventory.resources) return false;
  return Object.entries(recipe.recipe).every(
    ([resource, amount]) =>
      (inventory.resources?.[resource as keyof Resource] || 0) >= amount
  );
};

// Filtered recipes getter function | used to get recipes filtered by selected consumable type
export const getFilteredRecipes = (selectedConsumableType: ConsumableStats) => {
  return consumableRecipes.filter(
    (recipe) => recipe.name === selectedConsumableType
  );
};

// Block crafting validation function | used to check if player has enough resources (9) to craft a block
export const canCraftBlock = (
  material: keyof Resource,
  inventory: Inventory
): boolean => {
  return (inventory.resources?.[material] || 0) >= 9;
};
