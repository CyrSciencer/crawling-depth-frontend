import { ConsumableStats } from "../config/consumablesConfig";
import { Cell, EXIT_POSITIONS } from "../types/cells";
import { generateNextRoom } from "../events/nextRoomEvent";
import {
  calculateResourceGain,
  updateCellSelection,
  clearCellSelection,
} from "../utils/cellUtils";

// Chest Reward Configuration
interface Reward {
  type: "resource" | "consumable";
  name: string;
  value: number;
  chance: [number, number]; // [min, max]
}

const REWARDS: Reward[] = [
  { type: "resource", name: "iron", value: 4, chance: [0, 10] },
  { type: "resource", name: "silver", value: 4, chance: [10, 20] },
  { type: "resource", name: "gold", value: 4, chance: [20, 30] },
  { type: "resource", name: "tin", value: 4, chance: [30, 40] },
  { type: "resource", name: "zinc", value: 4, chance: [40, 50] },
  { type: "resource", name: "crystal", value: 4, chance: [50, 60] },
  { type: "resource", name: "copper", value: 4, chance: [60, 70] },
  { type: "consumable", name: "health", value: 10, chance: [70, 80] },
  { type: "consumable", name: "charge", value: 10, chance: [80, 90] },
  { type: "consumable", name: "power", value: 10, chance: [90, 100] },
];

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

export class Player implements PlayerData {
  public readonly inventory: Inventory;
  public readonly modifiedMaps: ModifiedMap[];
  public readonly position: Position;
  public readonly currentMap: string;
  public readonly movementPerTurn: number;
  public readonly health: number;
  public readonly recoveryCode: number;

  constructor(data: PlayerData) {
    this.inventory = data.inventory;
    this.modifiedMaps = data.modifiedMaps;
    this.position = data.position;
    this.currentMap = data.currentMap;
    this.movementPerTurn = data.movementPerTurn;
    this.health = data.health;
    this.recoveryCode = data.recoveryCode;
  }

  /**
   * Finds and returns the full ModifiedMap object for the player's current map.
   * @returns The ModifiedMap object or null if not found.
   */
  public getCurrentMap(): ModifiedMap | null {
    const mapToUse = this.modifiedMaps.find(
      (map) => map.personalID === this.currentMap
    );

    if (!mapToUse) {
      console.error("Current map not found in player's modifiedMaps array.");
      return null;
    }

    return mapToUse;
  }

  /**
   * Checks if the player can mine a given cell.
   * @param cell The cell to check.
   * @returns True if the player can mine the cell, false otherwise.
   */
  public canMine(cell: Cell): boolean {
    return (
      cell.type === "wall" &&
      this.inventory.equiped !== null &&
      "pickaxe" in this.inventory.equiped &&
      this.inventory.equiped.pickaxe !== undefined &&
      this.inventory.equiped.pickaxe.charge > 0
    );
  }

  /**
   * Checks if the player can place a block on a given cell.
   * @param cell The cell to check.
   * @returns True if the player can place a block, false otherwise.
   */
  public canPlaceBlock(cell: Cell): boolean {
    return (
      cell.type === "floor" &&
      this.inventory.equiped !== null &&
      "block" in this.inventory.equiped &&
      this.inventory.equiped.block !== undefined
    );
  }

  /**
   * Mines a cell, updating inventory with resources and pickaxe charge.
   * This is an immutable method that uses a type guard for safety.
   * @param cell The cell to mine.
   * @returns A new Player instance with the updated inventory, or the same instance if mining is not possible.
   */
  public mine(cell: Cell): Player {
    // This type guard ensures all conditions are met before proceeding.
    if (
      cell.type !== "wall" ||
      !this.inventory.equiped ||
      !("pickaxe" in this.inventory.equiped) ||
      !this.inventory.equiped.pickaxe ||
      this.inventory.equiped.pickaxe.charge <= 0 ||
      !this.inventory.tools?.pickaxe
    ) {
      return this; // If conditions aren't met, return the original instance.
    }

    // After the guard, TypeScript knows equiped has a pickaxe.
    const resourceGain = calculateResourceGain(cell);

    const newInventory: Inventory = {
      ...this.inventory,
      resources: Object.entries(resourceGain).reduce(
        (acc: Resource, [resource, amount]) => {
          const key = resource as keyof Resource;
          acc[key] = (acc[key] || 0) + (amount as number);
          return acc;
        },
        { ...this.inventory.resources } as Resource
      ),
      tools: {
        ...this.inventory.tools,
        pickaxe: {
          ...this.inventory.tools.pickaxe,
          charge: this.inventory.tools.pickaxe.charge - 1,
        },
      },
      equiped: {
        pickaxe: {
          ...this.inventory.equiped.pickaxe,
          charge: this.inventory.equiped.pickaxe.charge - 1,
        },
      },
    };

    return new Player({ ...this.toJSON(), inventory: newInventory });
  }

  /**
   * Places a block on a cell, updating inventory.
   * This is an immutable method that uses a type guard for safety.
   * @param cell The cell where the block will be placed.
   * @returns An object containing the new Player instance and the type of block placed, or the original instance if placement is not possible.
   */
  public placeBlock(cell: Cell): {
    newPlayer: Player;
    blockType: keyof Block | null;
  } {
    if (
      !this.canPlaceBlock(cell) ||
      !this.inventory.equiped ||
      !("block" in this.inventory.equiped) ||
      typeof this.inventory.equiped.block !== "string" || // The equipped item is a string name
      !this.inventory.blocks
    ) {
      return { newPlayer: this, blockType: null };
    }

    const blockName = this.inventory.equiped.block;
    const blockKey = `${blockName}Block` as keyof Block;

    if ((this.inventory.blocks[blockKey] || 0) <= 0) {
      return { newPlayer: this, blockType: null }; // No blocks of that type left
    }

    const newBlocks = {
      ...this.inventory.blocks,
      [blockKey]: (this.inventory.blocks[blockKey] || 0) - 1,
    };

    // After placing, we assume the player equips their pickaxe by default if they have one.
    const newEquiped = this.inventory.tools?.pickaxe
      ? { pickaxe: this.inventory.tools.pickaxe }
      : null;

    const newInventory: Inventory = {
      ...this.inventory,
      blocks: newBlocks,
      equiped: newEquiped,
    };

    return {
      newPlayer: new Player({ ...this.toJSON(), inventory: newInventory }),
      blockType: blockKey,
    };
  }

  /**
   * Selects or deselects a cell by updating its `isSelected` flag in the current map.
   * @param cell The cell to select, or null to clear all selections.
   * @returns A new Player instance with the updated cell selection state.
   */
  public selectCell(cell: Cell | null): Player {
    const currentMap = this.getCurrentMap();
    if (!currentMap) return this;

    const currentCells = currentMap.modifiedCells;
    const newCells = cell
      ? updateCellSelection(currentCells, cell)
      : clearCellSelection(currentCells);

    return this.updateCurrentMap(newCells);
  }

  /**
   * Applies a consumable's effect by calling the appropriate helper method.
   * This is an immutable method.
   * @param consumable The consumable to use.
   * @returns A new Player instance with the updated state.
   */
  public useConsumable(consumable: Consumable): Player {
    let newPlayerData: PlayerData;

    switch (consumable.impactStat) {
      case ConsumableStats.HEALTH:
        newPlayerData = this._applyHealthConsumable(consumable);
        break;
      case ConsumableStats.CHARGE:
        newPlayerData = this._applyPickaxeConsumable(consumable, "charge");
        break;
      case ConsumableStats.POWER:
        newPlayerData = this._applyPickaxeConsumable(consumable, "power");
        break;
      case ConsumableStats.BONUS:
        newPlayerData = this._applyPickaxeConsumable(consumable, "bonus");
        break;
      default:
        return this; // Return original instance if consumable type is unknown
    }
    return new Player(newPlayerData);
  }

  /**
   * Opens a chest, gets a random reward, and returns a new Player instance with an updated inventory.
   * @returns An object containing the new Player instance and the reward obtained.
   */
  public openChest(): { newPlayer: Player; reward: Reward | null } {
    const randomNumber = Math.floor(Math.random() * 100);
    const reward = REWARDS.find(
      (r) => randomNumber >= r.chance[0] && randomNumber < r.chance[1]
    );

    if (!reward) {
      return { newPlayer: this, reward: null };
    }

    let newInventory = { ...this.inventory };

    if (reward.type === "resource" && this.inventory.resources) {
      const newResources = { ...this.inventory.resources };
      const key = reward.name as keyof Resource;
      newResources[key] = (newResources[key] || 0) + reward.value;
      newInventory.resources = newResources;
    } else if (reward.type === "consumable" && this.inventory.consumables) {
      const newConsumables = [...this.inventory.consumables];
      newConsumables.push({
        impactStat: reward.name as ConsumableStats,
        impactValue: reward.value,
        quantity: reward.value,
      });
      newInventory.consumables = newConsumables;
    }

    const newPlayer = new Player({ ...this.toJSON(), inventory: newInventory });
    return { newPlayer, reward };
  }

  /**
   * Determines if the player is currently at an exit position.
   * Private helper for getExitDirection.
   * @returns The player's position if at an exit, otherwise null.
   */
  private getExitEventDetails(): { row: number; col: number } | null {
    const isAtExit = Object.values(EXIT_POSITIONS).some(
      (exitPos) =>
        exitPos.row === this.position.row && exitPos.col === this.position.col
    );

    return isAtExit ? this.position : null;
  }

  /**
   * Determines the cardinal direction of the exit the player is on.
   * @returns The direction 'N', 'E', 'S', 'W', or null if not on an exit.
   */
  public getExitDirection(): "N" | "E" | "S" | "W" | null {
    const exitPosition = this.getExitEventDetails();
    if (!exitPosition) {
      return null;
    }

    const exitDirection = (
      Object.keys(EXIT_POSITIONS) as Array<keyof typeof EXIT_POSITIONS>
    ).find(
      (dir) =>
        EXIT_POSITIONS[dir].row === exitPosition.row &&
        EXIT_POSITIONS[dir].col === exitPosition.col
    );

    return exitDirection || null;
  }

  /**
   * Checks for an exit, generates a new room if one is found,
   * and returns a new Player instance with the updated map data.
   * This is an immutable method.
   * @returns A Promise that resolves to a new Player instance.
   */
  public async discoverNewRoom(): Promise<Player> {
    try {
      const exitDirection = this.getExitDirection();
      if (exitDirection) {
        let exitLinkage: string = "";
        let entranceLinkage: string = "";
        if (exitDirection === "N") {
          exitLinkage = "up";
          entranceLinkage = "down";
        } else if (exitDirection === "E") {
          exitLinkage = "right";
          entranceLinkage = "left";
        } else if (exitDirection === "S") {
          exitLinkage = "down";
          entranceLinkage = "up";
        } else if (exitDirection === "W") {
          exitLinkage = "left";
          entranceLinkage = "right";
        }

        const currentMapInPlayer = this.getCurrentMap();
        if (!currentMapInPlayer) {
          throw new Error(
            "Could not find current map details in player state."
          );
        }

        // Check if there is already a map linked at this exit
        if ((currentMapInPlayer.exitLink as any)[exitLinkage]) {
          console.log("Exit is already linked to another map.");
          return this; // No change, return current instance
        }

        const result = await generateNextRoom(exitDirection);
        if (result) {
          const { roomData } = result;
          const newModifiedMaps = [...this.modifiedMaps];
          const currentMapIndex = newModifiedMaps.findIndex(
            (m) => m.personalID === this.currentMap
          );

          if (currentMapIndex === -1) {
            throw new Error(
              "Could not find current map in modifiedMaps array for updating."
            );
          }

          // Link current map to the new room
          (newModifiedMaps[currentMapIndex].exitLink as any)[exitLinkage] = (
            roomData as any
          )._id;

          const newRoom: ModifiedMap = {
            personalID: `player_${Date.now()}_${(roomData as any)._id}`,
            map: (roomData as any)._id,
            modifiedCells: (roomData as any).cells,
            exitLink: { up: null, down: null, left: null, right: null },
            firstTime: true,
          };

          // Link new room back to the current map
          (newRoom.exitLink as any)[entranceLinkage] =
            newModifiedMaps[currentMapIndex].map;

          newModifiedMaps.push(newRoom);

          // Return a new Player instance with the updated maps array
          return new Player({
            ...this.toJSON(), // Get a clean data object of the current player
            modifiedMaps: newModifiedMaps,
          });
        }
      }
    } catch (error) {
      // It's normal for this to have an error when not on an exit.
      // We can add more specific error handling later if needed.
    }
    // If no exit or an error occurs, return the current instance.
    return this;
  }

  /**
   * Returns a plain data object representation of the Player instance.
   * This is used automatically by JSON.stringify().
   * @returns A PlayerData object.
   */
  public toJSON(): PlayerData {
    return {
      inventory: this.inventory,
      modifiedMaps: this.modifiedMaps,
      position: this.position,
      currentMap: this.currentMap,
      movementPerTurn: this.movementPerTurn,
      health: this.health,
      recoveryCode: this.recoveryCode,
    };
  }

  /**
   * Moves the player to the next room if they are on a linked exit.
   * @returns A new Player instance with an updated position and currentMap, or the same instance if no move occurs.
   */
  public moveToRoom(): Player {
    const exitDirection = this.getExitDirection();
    if (!exitDirection) return this;

    const linkageMap: { [key: string]: "up" | "down" | "left" | "right" } = {
      N: "up",
      E: "right",
      S: "down",
      W: "left",
    };
    const newPositionMap = {
      N: { row: 8, col: 4 },
      E: { row: 4, col: 0 },
      S: { row: 0, col: 4 },
      W: { row: 4, col: 8 },
    };

    const currentMapData = this.getCurrentMap();
    if (!currentMapData) return this;

    const nextMapId = currentMapData.exitLink[linkageMap[exitDirection]];
    if (!nextMapId) {
      // This case should be handled by discoverNewRoom, but as a fallback, we do nothing.
      return this;
    }

    const nextMapData = this.modifiedMaps.find((m) => m.map === nextMapId);
    if (!nextMapData) return this;

    const newPosition = newPositionMap[exitDirection];

    return new Player({
      ...this.toJSON(),
      position: newPosition,
      currentMap: nextMapData.personalID,
    });
  }

  // Private helper methods for useConsumable
  private _applyHealthConsumable(consumable: Consumable): PlayerData {
    const newHealth = (this.health as number) + consumable.impactValue;
    const newConsumables =
      this.inventory.consumables?.filter(
        (c) => c.impactStat !== consumable.impactStat
      ) || [];
    return {
      ...this.toJSON(),
      health: newHealth,
      inventory: { ...this.inventory, consumables: newConsumables },
    };
  }

  private _applyPickaxeConsumable(
    consumable: Consumable,
    effect: "charge" | "power" | "bonus"
  ): PlayerData {
    if (!this.inventory.tools?.pickaxe) return this.toJSON();

    const newPickaxe = { ...this.inventory.tools.pickaxe };
    if (effect === "charge") newPickaxe.charge += consumable.impactValue;
    else if (effect === "power") newPickaxe.power += consumable.impactValue;
    else newPickaxe.bonus += String(consumable.impactValue);

    const newConsumables =
      this.inventory.consumables?.filter(
        (c) => c.impactStat !== consumable.impactStat
      ) || [];
    const newInventory: Inventory = {
      ...this.inventory,
      consumables: newConsumables,
      tools: { ...this.inventory.tools, pickaxe: newPickaxe },
      equiped: { ...this.inventory.equiped, pickaxe: newPickaxe },
    };
    return { ...this.toJSON(), inventory: newInventory };
  }

  /**
   * Updates the `modifiedCells` of the current map.
   * @param newCells The new array of cells to set for the current map.
   * @returns A new Player instance with the updated modifiedMaps array.
   */
  public updateCurrentMap(newCells: Cell[]): Player {
    const newModifiedMaps = this.modifiedMaps.map((map) => {
      if (map.personalID === this.currentMap) {
        return { ...map, modifiedCells: newCells };
      }
      return map;
    });

    return new Player({ ...this.toJSON(), modifiedMaps: newModifiedMaps });
  }
}
