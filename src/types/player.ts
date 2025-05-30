import { Cell } from "./cells";

interface Tool {
  charge: number;
  power: number;
  bonus: string;
}
interface consumable {
  impactStat: string;
  quantity: number;
}
interface Resource {
  stone: number;
  iron?: number;
  silver?: number;
  gold?: number;
  tin?: number;
  zinc?: number;
  crystal?: number;
}
interface Block {
  stoneBlock?: number;
  ironBlock?: number;
  silverBlock?: number;
  goldBlock?: number;
  tinBlock?: number;
  zincBlock?: number;
  crystalBlock?: number;
}
export interface Inventory {
  resources: Resource | null;
  blocks: Block | null;
  consumables: consumable[] | null;
  tools: {
    pickaxe: Tool;
  } | null;
  equiped: Tool | Block | null;
}

interface Player {
  inventory: Inventory;
  modifiedMaps: Array<Object>; //array of modified maps
  //position on current map.
  position: {
    row: number;
    col: number;
  };
  currentMap: string; //ref to the modified map (personnal ID)
  movementPerTurn: Number;
  health: Number;
}

export interface Position {
  row: number;
  col: number;
}

export enum Direction {
  UP = 360,
  RIGHT = 90,
  DOWN = 180,
  LEFT = 270,
}

// Constants for conversion
export const CELL_SIZE = 47.5; // Cell size in pixels
export const PLAYER_SIZE = 35; // Player size
export const PLAYER_MARGIN = CELL_SIZE - PLAYER_SIZE;

// Conversion functions
export const gridToPixel = (pos: Position) => ({
  x: pos.col * (CELL_SIZE + 2) + PLAYER_MARGIN,
  y: pos.row * (CELL_SIZE + 2) + PLAYER_MARGIN,
});

export const pixelToGrid = (x: number, y: number): Position => ({
  row: Math.round(y / CELL_SIZE),
  col: Math.round(x / CELL_SIZE),
});

// Direction utilities
export const getFacingCell = (
  position: Position,
  direction: Direction
): Position => {
  switch (direction) {
    case Direction.UP:
      return { row: position.row - 1, col: position.col };
    case Direction.RIGHT:
      return { row: position.row, col: position.col + 1 };
    case Direction.DOWN:
      return { row: position.row + 1, col: position.col };
    case Direction.LEFT:
      return { row: position.row, col: position.col - 1 };
  }
};

// Mining functions
const canMine = (cell: Cell, player: Player): boolean => {
  return (
    cell.type === "wall" &&
    player.inventory.equiped !== null &&
    "charge" in player.inventory.equiped &&
    player.inventory.equiped.charge > 0
  );
};

const calculateResourceGain = (cell: Cell): Resource => {
  return cell.resources || { stone: 0 };
};

const mineCell = (cell: Cell, player: Player): void => {
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

  // Réduire la charge de la pioche
  if (player.inventory.equiped && "charge" in player.inventory.equiped) {
    player.inventory.equiped.charge -= 1;
  }

  // Transformer le mur en sol
  cell.type = "floor";
  cell.resources = undefined;
};

// Movement validation
export const canMoveToCell = (cell: Cell | undefined): boolean => {
  if (!cell) return false;
  return cell.type === "floor" || cell.type === "exit";
};

export { canMine, calculateResourceGain, mineCell };
export default Player;
