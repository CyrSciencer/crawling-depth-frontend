import {
  Inventory,
  Resource,
  Block,
  Tool,
  Consumable,
} from "../../types/player";
import { useState, useCallback } from "react";
import "./Inventory.css";

interface InventoryWindowProps {
  inventory: Inventory;
  onInventoryChange: (newInventory: Inventory) => void;
}

export const InventoryWindow = ({
  inventory,
  onInventoryChange,
}: InventoryWindowProps) => {
  const [selectedType, setSelectedType] = useState<
    "pickaxe" | "block" | "consumable"
  >("pickaxe");

  const availableBlocks = inventory.blocks
    ? Object.entries(inventory.blocks)
        .filter(([_, value]) => value && value > 0)
        .map(([key]) => key.replace("Block", ""))
    : [];

  const availableConsumables = inventory.consumables
    ? inventory.consumables.map((consumable) => consumable.impactStat)
    : [];

  const handleEquip = (item: Tool | Consumable | Block) => {
    if (selectedType === "block") {
      const newInventory = {
        ...inventory,
        equiped: {
          block: item as Block,
        },
      };
      onInventoryChange(newInventory);
    }
    if (selectedType === "consumable") {
      const newInventory = {
        ...inventory,
        equiped: { consumable: item as Consumable },
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
        {inventory.consumables?.map((consumable) => (
          <p key={consumable.impactStat}>
            {consumable.impactStat}: {consumable.quantity}
          </p>
        ))}
      </div>
      <div className="inventory-section">
        <h2>Equipped</h2>
        <p>{JSON.stringify(inventory.equiped as Block | Consumable | Tool)}</p>
        <select
          value={selectedType}
          onChange={(e) =>
            setSelectedType(
              e.target.value as "pickaxe" | "block" | "consumable"
            )
          }
        >
          <option value="pickaxe">Pickaxe</option>
          {availableBlocks.length > 0 && <option value="block">Block</option>}
          {availableConsumables.length > 0 && (
            <option value="consumable">Consumable</option>
          )}
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

        {selectedType === "consumable" && availableConsumables.length > 0 && (
          <div className="equip-options">
            <h3>Available Consumables</h3>
            {availableConsumables.map((consumable) => (
              <button
                key={consumable}
                onClick={() => handleEquip(consumable as unknown as Consumable)}
                className="equip-button"
              >
                Equip {consumable}
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
