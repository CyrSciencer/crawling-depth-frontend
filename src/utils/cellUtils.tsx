import { Cell } from "../types/cells";
import { PlayerData, Resource, Block, Player } from "../models/PlayerModel";

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

export const calculateResourceGain = (cell: Cell): Resource => {
  return cell.resources as Resource;
};
