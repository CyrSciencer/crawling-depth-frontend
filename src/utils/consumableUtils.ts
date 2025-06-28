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

// Consumable use handler function | used to apply consumable effects and update player state
export const handleConsumableUse = (
  consumable: Consumable,
  player: PlayerData,
  inventory: Inventory,
  onPlayerChange: (newPlayer: PlayerData) => void
) => {
  let updatedPlayer: PlayerData;

  // Consumable effect application switch | used to apply different effects based on consumable type
  switch (consumable.impactStat) {
    case ConsumableStats.HEALTH:
      // Health restoration logic | used to increase player health and remove consumed item
      updatedPlayer = {
        ...player,
        health: (player.health as number) + (consumable.impactValue as number),
        inventory: {
          ...inventory,
          consumables:
            inventory.consumables?.filter(
              (c) => c.impactStat !== ConsumableStats.HEALTH
            ) || [],
        },
      };
      break;

    case ConsumableStats.CHARGE:
      // Pickaxe charge restoration logic | used to increase pickaxe charge and remove consumed item
      const currentPickaxe = inventory.tools?.pickaxe || {
        charge: 0,
        power: 1,
        bonus: "none",
      };
      updatedPlayer = {
        ...player,
        inventory: {
          ...inventory,
          tools: {
            ...inventory.tools,
            pickaxe: {
              charge:
                currentPickaxe.charge + (consumable.impactValue as number),
              power: currentPickaxe.power,
              bonus: currentPickaxe.bonus,
            },
          },
          consumables:
            inventory.consumables?.filter(
              (c) => c.impactStat !== ConsumableStats.CHARGE
            ) || [],
        },
      };
      // Equipped pickaxe charge update | used to update charge of currently equipped pickaxe
      if (
        updatedPlayer.inventory.equiped &&
        "pickaxe" in updatedPlayer.inventory.equiped
      ) {
        updatedPlayer.inventory.equiped.pickaxe!.charge =
          (updatedPlayer.inventory.equiped.pickaxe!.charge || 0) +
          (consumable.impactValue as number);
      }
      break;

    case ConsumableStats.POWER:
      // Pickaxe power enhancement logic | used to increase pickaxe power and remove consumed item
      const currentPickaxePower = inventory.tools?.pickaxe || {
        charge: 100,
        power: 1,
        bonus: "none",
      };
      updatedPlayer = {
        ...player,
        inventory: {
          ...inventory,
          tools: {
            ...inventory.tools,
            pickaxe: {
              charge: currentPickaxePower.charge,
              power:
                currentPickaxePower.power + (consumable.impactValue as number),
              bonus: currentPickaxePower.bonus,
            },
          },
          consumables:
            inventory.consumables?.filter(
              (c) => c.impactStat !== ConsumableStats.POWER
            ) || [],
        },
      };
      // Equipped pickaxe power update | used to update power of currently equipped pickaxe
      if (
        updatedPlayer.inventory.equiped &&
        "pickaxe" in updatedPlayer.inventory.equiped
      ) {
        updatedPlayer.inventory.equiped.pickaxe!.power =
          (updatedPlayer.inventory.equiped.pickaxe!.power || 0) +
          (consumable.impactValue as number);
      }
      break;

    case ConsumableStats.BONUS:
      // Pickaxe bonus enhancement logic | used to increase pickaxe bonus and remove consumed item
      const currentPickaxeBonus = inventory.tools?.pickaxe || {
        charge: 100,
        power: 1,
        bonus: "none",
      };
      updatedPlayer = {
        ...player,
        inventory: {
          ...inventory,
          consumables:
            inventory.consumables?.filter(
              (c) => c.impactStat !== ConsumableStats.BONUS
            ) || [],
          tools: {
            ...inventory.tools,
            pickaxe: {
              charge: currentPickaxeBonus.charge,
              power: currentPickaxeBonus.power,
              bonus:
                currentPickaxeBonus.bonus + (consumable.impactValue as number),
            },
          },
        },
      };
      // Equipped pickaxe bonus update | used to update bonus of currently equipped pickaxe
      if (
        updatedPlayer.inventory.equiped &&
        "pickaxe" in updatedPlayer.inventory.equiped
      ) {
        updatedPlayer.inventory.equiped.pickaxe!.bonus =
          (updatedPlayer.inventory.equiped.pickaxe!.bonus || "") +
          (consumable.impactValue as number);
      }
      break;

    default:
      console.error("Unknown consumable type:", consumable.impactStat);
      return;
  }

  onPlayerChange(updatedPlayer as PlayerData);
  console.log(
    `Using ${consumable.impactStat} with impact ${consumable.impactValue}`
  );
};
