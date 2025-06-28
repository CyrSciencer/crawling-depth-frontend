import { ConsumableStats } from "../config/consumablesConfig";
import { Cell } from "../types/cells";

// Data interfaces for the Player model

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

export interface Position {
  row: number;
  col: number;
}

export interface ModifiedMap {
  personalID: string;
  map: string; // Originally was mongoose.Types.ObjectId, using string for frontend.
  modifiedCells: Cell[];
  exitLink: {
    up: string | null;
    down: string | null;
    left: string | null;
    right: string | null;
  };
  firstTime: boolean;
}

export interface PlayerData {
  inventory: Inventory;
  modifiedMaps: ModifiedMap[];
  position: Position;
  currentMap: string;
  movementPerTurn: number;
  health: number;
  recoveryCode: number;
}
