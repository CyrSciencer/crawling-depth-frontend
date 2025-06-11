import {
  Inventory,
  Resource,
  Block,
  Tool,
  Consumable,
  Player,
} from "../../types/player";
import { ConsumableStats, consumableRecipes } from "../../utils/consomables";
import { useState, useCallback } from "react";
import "./Inventory.css";

interface InventoryWindowProps {
  inventory: Inventory;
  onInventoryChange: (newInventory: Inventory) => void;
  player: Player;
  onPlayerChange: (newPlayer: Player) => void;
}

export const InventoryWindow = ({
  inventory,
  onInventoryChange,
  player,
  onPlayerChange,
}: InventoryWindowProps) => {
  const [selectedType, setSelectedType] = useState<"pickaxe" | "block">(
    "pickaxe"
  );
  const [selectedConsumableType, setSelectedConsumableType] =
    useState<ConsumableStats>(ConsumableStats.HEALTH);

  const availableBlocks = inventory.blocks
    ? Object.entries(inventory.blocks)
        .filter(([_, value]) => value && value > 0)
        .map(([key]) => key.replace("Block", ""))
    : [];

  const handleEquip = (item: Tool | Block) => {
    if (selectedType === "block") {
      const newInventory = {
        ...inventory,
        equiped: {
          block: item as Block,
        },
      };
      onInventoryChange(newInventory);
    }
    if (selectedType === "pickaxe") {
      const newInventory = {
        ...inventory,
        equiped: { pickaxe: item as Tool },
      };
      onInventoryChange(newInventory);
    }
    console.log(`Equipping ${item} of type ${selectedType}`);
  };

  const handleBlockCraft = useCallback(
    (material: keyof Resource) => {
      if (!inventory.resources || !inventory.blocks) return;

      const newResources = { ...inventory.resources };
      const newBlocks = { ...inventory.blocks };

      newResources[material] -= 9;
      const blockKey = `${material}Block` as keyof Block;
      newBlocks[blockKey] = (newBlocks[blockKey] || 0) + 1;

      const newInventory = {
        ...inventory,
        resources: newResources,
        blocks: newBlocks,
      };

      onInventoryChange(newInventory);
    },
    [inventory, onInventoryChange]
  );

  const handleConsumableCraft = useCallback(
    (recipe: (typeof consumableRecipes)[0]) => {
      try {
        // Validate recipe structure
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

        // Initialize consumables array if it doesn't exist
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

        // Check if we have enough resources
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

        // Create new resources object with reduced amounts
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

        // Create or update consumable
        const newConsumables = [...currentConsumables];
        const existingConsumableIndex = newConsumables.findIndex(
          (c) => c.impactStat === recipe.name && c.impactValue === recipe.impact
        );

        if (existingConsumableIndex >= 0) {
          // Update existing consumable
          newConsumables[existingConsumableIndex] = {
            ...newConsumables[existingConsumableIndex],
            quantity:
              (newConsumables[existingConsumableIndex].quantity || 0) +
              recipe.quantity,
          };
        } else {
          // Add new consumable
          newConsumables.push({
            impactStat: recipe.name,
            impactValue: recipe.impact,
            quantity: recipe.quantity,
          });
        }

        // Update inventory
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
    },
    [inventory, onInventoryChange]
  );

  const canCraftRecipe = (recipe: (typeof consumableRecipes)[0]) => {
    if (!inventory.resources) return false;
    return Object.entries(recipe.recipe).every(
      ([resource, amount]) =>
        (inventory.resources?.[resource as keyof Resource] || 0) >= amount
    );
  };

  const getFilteredRecipes = () => {
    return consumableRecipes.filter(
      (recipe) => recipe.name === selectedConsumableType
    );
  };

  const handleConsumableUse = (consumable: Consumable) => {
    if (consumable.impactStat === ConsumableStats.HEALTH) {
      const updatedPlayer = {
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
      onPlayerChange(updatedPlayer);
    }
    if (consumable.impactStat === ConsumableStats.CHARGE) {
      const updatedPlayer = {
        ...player,
        inventory: {
          ...inventory,
          tools: {
            ...inventory.tools,
            pickaxe: {
              ...inventory.tools?.pickaxe,
              charge:
                (inventory.tools?.pickaxe?.charge || 0) +
                (consumable.impactValue as number),
            },
          },
          consumables:
            inventory.consumables?.filter(
              (c) => c.impactStat !== ConsumableStats.CHARGE
            ) || [],
        },
      };
      if (
        updatedPlayer.inventory.equiped &&
        "pickaxe" in updatedPlayer.inventory.equiped
      ) {
        updatedPlayer.inventory.equiped.pickaxe!.charge =
          (updatedPlayer.inventory.equiped.pickaxe!.charge || 0) +
          (consumable.impactValue as number);
      }
      onPlayerChange(updatedPlayer as Player);
    }
    if (consumable.impactStat === ConsumableStats.POWER) {
      const updatedPlayer = {
        ...player,
        inventory: {
          ...inventory,
          tools: {
            ...inventory.tools,
            pickaxe: {
              ...inventory.tools?.pickaxe,
              power:
                (inventory.tools?.pickaxe?.power || 0) +
                (consumable.impactValue as number),
            },
          },
          consumables:
            inventory.consumables?.filter(
              (c) => c.impactStat !== ConsumableStats.POWER
            ) || [],
        },
      };
      if (
        updatedPlayer.inventory.equiped &&
        "pickaxe" in updatedPlayer.inventory.equiped
      ) {
        updatedPlayer.inventory.equiped.pickaxe!.power =
          (updatedPlayer.inventory.equiped.pickaxe!.power || 0) +
          (consumable.impactValue as number);
      }
      onPlayerChange(updatedPlayer as Player);
    }
    if (consumable.impactStat === ConsumableStats.BONUS) {
      const updatedPlayer = {
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
              ...inventory.tools?.pickaxe,
              bonus:
                (inventory.tools?.pickaxe?.bonus || "") +
                (consumable.impactValue as number),
            },
          },
        },
      };
      if (
        updatedPlayer.inventory.equiped &&
        "pickaxe" in updatedPlayer.inventory.equiped
      ) {
        updatedPlayer.inventory.equiped.pickaxe!.bonus =
          (updatedPlayer.inventory.equiped.pickaxe!.bonus || "") +
          (consumable.impactValue as number);
      }
      onPlayerChange(updatedPlayer as Player);
    }
    console.log(
      `Using ${consumable.impactStat} with impact ${consumable.impactValue}`
    );
  };

  return (
    <div className="inventory-container">
      <div className="inventory-section">
        <h2>Resources</h2>
        <p>Stone: {inventory.resources?.stone || 0}</p>
        <p>Iron: {inventory.resources?.iron || 0}</p>
        <p>Silver: {inventory.resources?.silver || 0}</p>
        <p>Gold: {inventory.resources?.gold || 0}</p>
        <p>Tin: {inventory.resources?.tin || 0}</p>
        <p>Zinc: {inventory.resources?.zinc || 0}</p>
        <p>Crystal: {inventory.resources?.crystal || 0}</p>
        <p>Copper: {inventory.resources?.copper || 0}</p>
      </div>
      <div className="inventory-section">
        <h2>Blocks</h2>
        <p>
          Stone: {inventory.blocks?.stoneBlock || 0}{" "}
          {inventory.resources?.stone && inventory.resources.stone >= 9 && (
            <button onClick={() => handleBlockCraft("stone")}>create</button>
          )}
        </p>
        <p>
          Iron: {inventory.blocks?.ironBlock || 0}{" "}
          {inventory.resources?.iron && inventory.resources.iron >= 9 && (
            <button onClick={() => handleBlockCraft("iron")}>create</button>
          )}
        </p>
        <p>
          Silver: {inventory.blocks?.silverBlock || 0}{" "}
          {inventory.resources?.silver && inventory.resources.silver >= 9 && (
            <button onClick={() => handleBlockCraft("silver")}>create</button>
          )}
        </p>
        <p>
          Gold: {inventory.blocks?.goldBlock || 0}{" "}
          {inventory.resources?.gold && inventory.resources.gold >= 9 && (
            <button onClick={() => handleBlockCraft("gold")}>create</button>
          )}
        </p>
        <p>
          Tin: {inventory.blocks?.tinBlock || 0}{" "}
          {inventory.resources?.tin && inventory.resources.tin >= 9 && (
            <button onClick={() => handleBlockCraft("tin")}>create</button>
          )}
        </p>
        <p>
          Zinc: {inventory.blocks?.zincBlock || 0}{" "}
          {inventory.resources?.zinc && inventory.resources.zinc >= 9 && (
            <button onClick={() => handleBlockCraft("zinc")}>create</button>
          )}
        </p>
        <p>
          Crystal: {inventory.blocks?.crystalBlock || 0}{" "}
          {inventory.resources?.crystal && inventory.resources.crystal >= 9 && (
            <button onClick={() => handleBlockCraft("crystal")}>create</button>
          )}
        </p>
      </div>
      <div className="inventory-section">
        <h2>Consumables</h2>
        <select
          value={selectedConsumableType}
          onChange={(e) =>
            setSelectedConsumableType(e.target.value as ConsumableStats)
          }
        >
          <option value={ConsumableStats.HEALTH}>Health</option>
          <option value={ConsumableStats.CHARGE}>Charge</option>
          <option value={ConsumableStats.POWER}>Power</option>
          <option value={ConsumableStats.BONUS}>Bonus</option>
        </select>

        <div className="recipe-list">
          {getFilteredRecipes().map((recipe, index) => (
            <div key={index} className="recipe-item">
              <h3>{recipe.name} Recipe</h3>
              <div className="recipe-details">
                <p>Impact: {recipe.impact}</p>
                <p>Craft Time: {recipe.craftTime}</p>
                <div className="recipe-resources">
                  {Object.entries(recipe.recipe)
                    .filter(([_, amount]) => amount > 0)
                    .map(([resource, amount]) => (
                      <p
                        key={resource}
                        className={
                          canCraftRecipe(recipe)
                            ? "resource-available"
                            : "resource-missing"
                        }
                      >
                        {resource}: {amount} (Have:{" "}
                        {inventory.resources?.[resource as keyof Resource] || 0}
                        )
                      </p>
                    ))}
                </div>
                <button
                  onClick={() => handleConsumableCraft(recipe)}
                  disabled={!canCraftRecipe(recipe)}
                  className={
                    canCraftRecipe(recipe)
                      ? "craft-button"
                      : "craft-button-disabled"
                  }
                >
                  Craft
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="current-consumables">
          <h3>Current Consumables</h3>
          {inventory.consumables?.map((consumable) => (
            <p key={consumable.impactStat}>
              {consumable.impactStat} ({consumable.impactValue}) :{" "}
              {consumable.quantity}{" "}
              <button onClick={() => handleConsumableUse(consumable)}>
                Use
              </button>
            </p>
          ))}
        </div>
      </div>
      <div className="inventory-section">
        <h2>Equipped</h2>
        <p>{JSON.stringify(inventory.equiped as Block | Tool)}</p>
        <select
          value={selectedType}
          onChange={(e) =>
            setSelectedType(e.target.value as "pickaxe" | "block")
          }
        >
          <option value="pickaxe">Pickaxe</option>
          {availableBlocks.length > 0 && <option value="block">Block</option>}
        </select>

        {selectedType === "block" && availableBlocks.length > 0 && (
          <div className="equip-options">
            <h3>Available Blocks</h3>
            {availableBlocks.map((block) => (
              <button
                key={block}
                onClick={() => handleEquip(block as Block)}
                className="equip-button"
              >
                Equip {block} Block
              </button>
            ))}
          </div>
        )}

        {selectedType === "pickaxe" && (
          <div className="equip-options">
            {inventory.tools?.pickaxe && (
              <button
                onClick={() =>
                  handleEquip(inventory.tools?.pickaxe as unknown as Tool)
                }
                className="equip-button"
              >
                Equip Pickaxe
              </button>
            )}
            {inventory.equiped !== null &&
              "pickaxe" in inventory.equiped &&
              inventory.equiped.pickaxe && (
                <div className="equipped-item">
                  <h3>Pickaxe</h3>
                  <p>Charge: {inventory.equiped.pickaxe.charge}</p>
                  <p>Power: {inventory.equiped.pickaxe.power}</p>
                  <p>Bonus: {inventory.equiped.pickaxe.bonus}</p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
