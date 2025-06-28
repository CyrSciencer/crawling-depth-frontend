import { Cell } from "../types/cells";
import { PlayerData, Resource, Block } from "../models/Player";

// Cell utilities module loading logging | used for debugging module initialization
console.log("🎯 Cell utilities module loaded");

// Cell class name generator function | used to generate CSS classes for cell styling based on type and resources
export const getCellClassName = (cell: Cell): string => {
  // Base class determination | used to assign the primary CSS class based on cell type
  const baseClass = cell.isSelected
    ? "selected"
    : cell.type === "unbreakable"
    ? "unbreakable"
    : cell.type === "exit"
    ? "exit"
    : cell.type === "wall"
    ? "wall"
    : cell.type === "chest"
    ? "chest"
    : "floor";

  // Resource class generation | used to add resource-specific CSS classes for cells with max resources
  const resourceClass = cell.resources
    ? Object.entries(cell.resources)
        .filter(([_, value]) => value === 9)
        .map(([key]) => key)
        .join(" ")
    : "";

  return `${baseClass} ${resourceClass}`.trim();
};

// Cell selection update function | used to update the selection state of cells when a cell is clicked
export const updateCellSelection = (
  cells: Cell[],
  selectedCell: Cell
): Cell[] => {
  return cells.map((c) => ({
    ...c,
    isSelected: c.row === selectedCell.row && c.col === selectedCell.col,
  }));
};

// Cell selection clearing function | used to clear all cell selections when player moves or selection changes
export const clearCellSelection = (cells: Cell[]): Cell[] => {
  return cells.map((cell) => ({
    ...cell,
    isSelected: false,
  }));
};

// Cell resource information extractor | used to format cell resource information for display
export const getCellResourceInfo = (cell: Cell): string => {
  if (!cell.resources) return "";

  return Object.entries(cell.resources)
    .filter(([_, value]) => value && value > 0)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};

// Cell information display component | used to render detailed information about a selected cell
export const renderCellInfo = (selectedCell: Cell | null) => {
  if (!selectedCell) return null;

  const resourceInfo = getCellResourceInfo(selectedCell);

  return (
    <div className="cell-info">
      <h3>Cell Information</h3>
      <div className="cell-info-section">
        <strong>Position:</strong> Row {selectedCell.row}, Col{" "}
        {selectedCell.col}
      </div>
      <div className="cell-info-section">
        <strong>Type:</strong> {selectedCell.type}
      </div>
      {resourceInfo && (
        <div className="cell-info-section">
          <strong>Resources:</strong>
          <div className="resources-container">{resourceInfo}</div>
        </div>
      )}
    </div>
  );
};

// Movement validation
export const canMoveToCell = (cell: Cell | undefined): boolean => {
  if (!cell) return false;
  return cell.type === "floor" || cell.type === "exit" || cell.type === "trap";
};

// Mining functions
export const canMine = (cell: Cell, player: PlayerData): boolean => {
  return (
    cell.type === "wall" &&
    player.inventory.equiped !== null &&
    "pickaxe" in player.inventory.equiped &&
    player.inventory.equiped.pickaxe !== undefined &&
    player.inventory.equiped.pickaxe.charge > 0
  );
};

// Place block functions
export const canPlaceBlock = (cell: Cell, player: PlayerData): boolean => {
  return (
    cell.type === "floor" &&
    player.inventory.equiped !== null &&
    "block" in player.inventory.equiped &&
    player.inventory.equiped.block !== undefined
  );
};

export const calculateResourceGain = (cell: Cell): Resource => {
  return cell.resources as Resource;
};

export const placeBlock = (cell: Cell, player: PlayerData): void => {
  if (!canPlaceBlock(cell, player)) return;

  // Mettre à jour l'inventaire
  if (
    player.inventory.equiped !== null &&
    "block" in player.inventory.equiped &&
    player.inventory.blocks !== null
  ) {
    const blockToUse = player.inventory.equiped.block as unknown as string;
    if (blockToUse) {
      const blockKey = (blockToUse + "Block") as keyof Block;
      const currentCount = player.inventory.blocks[blockKey] || 0;
      if (currentCount > 0) {
        player.inventory.blocks[blockKey] = currentCount - 1;
        cell.type = "wall";
        const resourceType = blockToUse.replace("Block", "") as keyof Resource;
        cell.resources = {
          stone: 0,
          [resourceType]: 9,
        };

        // Vérifier si c'était le dernier bloc
        if (currentCount - 1 === 0 && player.inventory.tools?.pickaxe) {
          player.inventory.equiped = {
            pickaxe: player.inventory.tools.pickaxe,
          };
        }
      }
    }
  }
};

export const mineCell = (cell: Cell, player: PlayerData): void => {
  if (!canMine(cell, player)) return;

  // Récupérer les ressources
  const resourceGain = calculateResourceGain(cell);

  // Mettre à jour l'inventaire
  if (player.inventory.resources) {
    player.inventory.resources = {
      ...player.inventory.resources,
      ...Object.entries(resourceGain).reduce(
        (acc, [resource, amount]) => ({
          ...acc,
          [resource]:
            (player.inventory.resources?.[resource as keyof Resource] || 0) +
            amount,
        }),
        {}
      ),
    };
  }

  // Transformer le mur en sol
  cell.type = "floor";
  cell.resources = undefined;
};
