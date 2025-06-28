import { Inventory, Resource, Consumable, PlayerData } from "../models/Player";
import {
  ConsumableStats,
  consumableRecipes,
} from "../config/consumablesConfig";

// Consumable utilities module loading logging | used for debugging module initialization
console.log("💊 Consumable utilities module loaded");

// Consumable crafting handler function | used to craft consumables from resources and update inventory
export const handleConsumableCraft = (
  recipe: (typeof consumableRecipes)[0],
  inventory: Inventory,
  onInventoryChange: (newInventory: Inventory) => void
) => {
  try {
    // Recipe structure validation | used to ensure the recipe has all required properties
    if (
      !recipe ||
      !recipe.recipe ||
      !recipe.name ||
      !recipe.impact ||
      !recipe.quantity
    ) {
      console.error("Invalid recipe structure");
      return;
    }

    // Inventory state initialization | used to set up default values for consumables and resources
    const currentConsumables = inventory.consumables || [];
    const currentResources: Resource = inventory.resources || {
      stone: 0,
      iron: 0,
      silver: 0,
      gold: 0,
      tin: 0,
      zinc: 0,
      crystal: 0,
      copper: 0,
    };

    // Resource availability check | used to verify player has enough resources to craft the consumable
    const missingResources = Object.entries(recipe.recipe)
      .filter(([_, amount]) => amount > 0)
      .filter(
        ([resource, amount]) =>
          (currentResources[resource as keyof Resource] || 0) < amount
      );

    if (missingResources.length > 0) {
      console.log("Not enough resources:", missingResources);
      return;
    }

    // Resource consumption | used to subtract required resources from player inventory
    const newResources: Resource = { ...currentResources };
    Object.entries(recipe.recipe).forEach(([resource, amount]) => {
      if (amount > 0) {
        const currentAmount = newResources[resource as keyof Resource] || 0;
        newResources[resource as keyof Resource] = Math.max(
          0,
          currentAmount - amount
        );
      }
    });

    // Consumable creation or update | used to add new consumable or update existing one
    const newConsumables = [...currentConsumables];
    const existingConsumableIndex = newConsumables.findIndex(
      (c) => c.impactStat === recipe.name && c.impactValue === recipe.impact
    );

    if (existingConsumableIndex >= 0) {
      // Existing consumable quantity update | used to increase quantity of existing consumable
      newConsumables[existingConsumableIndex] = {
        ...newConsumables[existingConsumableIndex],
        quantity:
          (newConsumables[existingConsumableIndex].quantity || 0) +
          recipe.quantity,
      };
    } else {
      // New consumable creation | used to add a new consumable to the inventory
      newConsumables.push({
        impactStat: recipe.name,
        impactValue: recipe.impact,
        quantity: recipe.quantity,
      });
    }

    // Inventory update | used to create new inventory with updated resources and consumables
    const newInventory: Inventory = {
      ...inventory,
      resources: newResources,
      consumables: newConsumables,
    };

    onInventoryChange(newInventory);
    console.log(
      `Successfully crafted ${recipe.quantity}x ${recipe.name} with impact ${recipe.impact}`
    );
  } catch (error) {
    console.error("Error crafting consumable:", error);
  }
};
