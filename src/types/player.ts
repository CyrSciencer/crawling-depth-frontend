import { log } from "console";
import { Cell } from "./cells";
import { ConsumableStats } from "../config/consumablesConfig";

export interface Tool {
  charge: number;
  power: number;
  bonus: string;
}
export interface Consumable {
  impactStat: ConsumableStats;
  impactValue: number;
  quantity: number;
}
export interface Resource {
  stone: number;
  iron?: number;
  silver?: number;
  gold?: number;
  tin?: number;
  zinc?: number;
  crystal?: number;
  copper?: number;
}
export interface Block {
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
  consumables: Consumable[] | null;
  tools: {
    pickaxe: Tool;
  } | null;
  equiped:
    | {
        pickaxe?: Tool;
      }
    | {
        block?: Block;
      }
    | {
        consumable?: Consumable;
      }
    | null;
}

export interface Player {
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
  recoveryCode: Number;
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
export const canMine = (cell: Cell, player: Player): boolean => {
  return (
    cell.type === "wall" &&
    player.inventory.equiped !== null &&
    "pickaxe" in player.inventory.equiped &&
    player.inventory.equiped.pickaxe !== undefined &&
    player.inventory.equiped.pickaxe.charge > 0
  );
};
// Place block functions
export const canPlaceBlock = (cell: Cell, player: Player): boolean => {
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
export const placeBlock = (cell: Cell, player: Player): void => {
  if (!canPlaceBlock(cell, player)) return;

  // Mettre à jour l'inventaire
  if (
    player.inventory.equiped !== null &&
    "block" in player.inventory.equiped &&
    player.inventory.blocks !== null
  ) {
    const blockToUse = player.inventory.equiped.block as string;
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

export const mineCell = (cell: Cell, player: Player): void => {
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

// Movement validation
export const canMoveToCell = (cell: Cell | undefined): boolean => {
  if (!cell) return false;
  return cell.type === "floor" || cell.type === "exit" || cell.type === "trap";
};

export default Player;
