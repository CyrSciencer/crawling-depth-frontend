import {
  Inventory,
  Resource,
  Block,
  Tool,
  Consumable,
} from "../../types/player";
import { useState, useCallback, useEffect } from "react";
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
  const [localInventory, setLocalInventory] = useState(inventory);

  const availableBlocks = localInventory.blocks
    ? Object.entries(localInventory.blocks)
        .filter(([_, value]) => value && value > 0)
        .map(([key]) => key.replace("Block", ""))
    : [];

  const availableConsumables = localInventory.consumables
    ? localInventory.consumables.map((consumable) => consumable.impactStat)
    : [];

  // Update local inventory when prop changes
  useEffect(() => {
    setLocalInventory(inventory);
  }, [inventory]);

  const handleEquip = (item: Tool | Consumable | Block) => {
    if (selectedType === "block") {
      const newInventory = {
        ...localInventory,
        equiped: {
          block: item as Block,
        },
      };
      setLocalInventory(newInventory);
      onInventoryChange(newInventory);
    }
    if (selectedType === "consumable") {
      const newInventory = {
        ...localInventory,
        equiped: { consumable: item as Consumable },
      };
      setLocalInventory(newInventory);
      onInventoryChange(newInventory);
    }
    if (selectedType === "pickaxe") {
      const newInventory = {
        ...localInventory,
        equiped: { pickaxe: item as Tool },
      };
      setLocalInventory(newInventory);
      onInventoryChange(newInventory);
    }
    console.log(`Equipping ${item} of type ${selectedType}`);
  };

  const handleBlockCraft = useCallback(
    (material: keyof Resource) => {
      if (!localInventory.resources || !localInventory.blocks) return;

      const newResources = { ...localInventory.resources };
      const newBlocks = { ...localInventory.blocks };

      newResources[material] -= 9;
      const blockKey = `${material}Block` as keyof Block;
      newBlocks[blockKey] = (newBlocks[blockKey] || 0) + 1;

      const newInventory = {
        ...localInventory,
        resources: newResources,
        blocks: newBlocks,
      };

      setLocalInventory(newInventory);
      onInventoryChange(newInventory);
    },
    [localInventory, onInventoryChange]
  );

  return (
    <div className="inventory-container">
      <div className="inventory-section">
        <h2>Resources</h2>
        <p>Stone: {localInventory.resources?.stone || 0}</p>
        <p>Iron: {localInventory.resources?.iron || 0}</p>
        <p>Silver: {localInventory.resources?.silver || 0}</p>
        <p>Gold: {localInventory.resources?.gold || 0}</p>
        <p>Tin: {localInventory.resources?.tin || 0}</p>
        <p>Zinc: {localInventory.resources?.zinc || 0}</p>
        <p>Crystal: {localInventory.resources?.crystal || 0}</p>
      </div>
      <div className="inventory-section">
        <h2>Blocks</h2>
        <p>
          Stone: {localInventory.blocks?.stoneBlock || 0}{" "}
          {localInventory.resources?.stone &&
            localInventory.resources.stone >= 9 && (
              <button onClick={() => handleBlockCraft("stone")}>create</button>
            )}
        </p>
        <p>
          Iron: {localInventory.blocks?.ironBlock || 0}{" "}
          {localInventory.resources?.iron &&
            localInventory.resources.iron >= 9 && (
              <button onClick={() => handleBlockCraft("iron")}>create</button>
            )}
        </p>
        <p>Silver: {localInventory.blocks?.silverBlock || 0}</p>
        <p>Gold: {localInventory.blocks?.goldBlock || 0}</p>
        <p>Tin: {localInventory.blocks?.tinBlock || 0}</p>
        <p>Zinc: {localInventory.blocks?.zincBlock || 0}</p>
        <p>Crystal: {localInventory.blocks?.crystalBlock || 0}</p>
      </div>
      <div className="inventory-section">
        <h2>Consumables</h2>
        {localInventory.consumables?.map((consumable) => (
          <p key={consumable.impactStat}>
            {consumable.impactStat}: {consumable.quantity}
          </p>
        ))}
      </div>
      <div className="inventory-section">
        <h2>Equipped</h2>
        <p>{JSON.stringify(localInventory.equiped)}</p>
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
            {localInventory.tools?.pickaxe && (
              <button
                onClick={() =>
                  handleEquip(localInventory.tools?.pickaxe as unknown as Tool)
                }
                className="equip-button"
              >
                Equip Pickaxe
              </button>
            )}
            {localInventory.equiped !== null &&
              "pickaxe" in localInventory.equiped &&
              localInventory.equiped.pickaxe && (
                <div className="equipped-item">
                  <h3>Pickaxe</h3>
                  <p>Charge: {localInventory.equiped.pickaxe.charge}</p>
                  <p>Power: {localInventory.equiped.pickaxe.power}</p>
                  <p>Bonus: {localInventory.equiped.pickaxe.bonus}</p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
