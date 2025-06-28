import React from "react";
import { Inventory, Resource, Block, Tool } from "../../models/Player";
import {
  ConsumableStats,
  ConsumableRecipe,
} from "../../config/consumablesConfig";
import { canCraftBlock } from "../../utils/inventoryUtils";

interface ResourcesSectionProps {
  inventory: Inventory;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({
  inventory,
}) => (
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
);

interface BlocksSectionProps {
  inventory: Inventory;
  onBlockCraft: (material: keyof Resource) => void;
}

export const BlocksSection: React.FC<BlocksSectionProps> = ({
  inventory,
  onBlockCraft,
}) => (
  <div className="inventory-section">
    <h2>Blocks</h2>
    <p>
      Stone: {inventory.blocks?.stoneBlock || 0}{" "}
      {canCraftBlock("stone", inventory) && (
        <button onClick={() => onBlockCraft("stone")}>create</button>
      )}
    </p>
    <p>
      Iron: {inventory.blocks?.ironBlock || 0}{" "}
      {canCraftBlock("iron", inventory) && (
        <button onClick={() => onBlockCraft("iron")}>create</button>
      )}
    </p>
    <p>
      Silver: {inventory.blocks?.silverBlock || 0}{" "}
      {canCraftBlock("silver", inventory) && (
        <button onClick={() => onBlockCraft("silver")}>create</button>
      )}
    </p>
    <p>
      Gold: {inventory.blocks?.goldBlock || 0}{" "}
      {canCraftBlock("gold", inventory) && (
        <button onClick={() => onBlockCraft("gold")}>create</button>
      )}
    </p>
    <p>
      Tin: {inventory.blocks?.tinBlock || 0}{" "}
      {canCraftBlock("tin", inventory) && (
        <button onClick={() => onBlockCraft("tin")}>create</button>
      )}
    </p>
    <p>
      Zinc: {inventory.blocks?.zincBlock || 0}{" "}
      {canCraftBlock("zinc", inventory) && (
        <button onClick={() => onBlockCraft("zinc")}>create</button>
      )}
    </p>
    <p>
      Crystal: {inventory.blocks?.crystalBlock || 0}{" "}
      {canCraftBlock("crystal", inventory) && (
        <button onClick={() => onBlockCraft("crystal")}>create</button>
      )}
    </p>
  </div>
);

interface ConsumablesSectionProps {
  inventory: Inventory;
  selectedConsumableType: ConsumableStats;
  onConsumableTypeChange: (type: ConsumableStats) => void;
  onConsumableCraft: (recipe: ConsumableRecipe) => void;
  onConsumableUse: (consumable: any) => void;
  canCraftRecipe: (recipe: ConsumableRecipe) => boolean;
  getFilteredRecipes: () => ConsumableRecipe[];
}

export const ConsumablesSection: React.FC<ConsumablesSectionProps> = ({
  inventory,
  selectedConsumableType,
  onConsumableTypeChange,
  onConsumableCraft,
  onConsumableUse,
  canCraftRecipe,
  getFilteredRecipes,
}) => (
  <div className="inventory-section">
    <h2>Consumables</h2>
    <select
      value={selectedConsumableType}
      onChange={(e) =>
        onConsumableTypeChange(e.target.value as ConsumableStats)
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
                    {inventory.resources?.[resource as keyof Resource] || 0})
                  </p>
                ))}
            </div>
            <button
              onClick={() => onConsumableCraft(recipe)}
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
          <button onClick={() => onConsumableUse(consumable)}>Use</button>
        </p>
      ))}
    </div>
  </div>
);

interface EquippedSectionProps {
  inventory: Inventory;
  selectedType: "pickaxe" | "block";
  onTypeChange: (type: "pickaxe" | "block") => void;
  availableBlocks: string[];
  onEquip: (item: Tool | Block) => void;
}

export const EquippedSection: React.FC<EquippedSectionProps> = ({
  inventory,
  selectedType,
  onTypeChange,
  availableBlocks,
  onEquip,
}) => (
  <div className="inventory-section">
    <h2>Equipped</h2>
    <p>{JSON.stringify(inventory.equiped as Block | Tool)}</p>
    <select
      value={selectedType}
      onChange={(e) => onTypeChange(e.target.value as "pickaxe" | "block")}
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
            onClick={() => onEquip(block as Block)}
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
            onClick={() => onEquip(inventory.tools?.pickaxe as unknown as Tool)}
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
);
