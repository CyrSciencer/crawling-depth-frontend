import { Cell, EXIT_POSITIONS } from "../types/cells";
import { ModifiedMap } from "./PlayerModel";

console.log("🗺️ Map model module loaded");

export class Map implements ModifiedMap {
  public readonly personalID: string;
  public readonly map: string;
  public readonly modifiedCells: Cell[];
  public readonly exitLink: {
    up: string | null;
    down: string | null;
    left: string | null;
    right: string | null;
  };
  public readonly firstTime: boolean;
  public readonly chest: boolean;

  public get cells(): Cell[] {
    return this.modifiedCells;
  }

  constructor(data: ModifiedMap) {
    this.personalID = data.personalID;
    this.map = data.map;
    this.modifiedCells = data.modifiedCells;
    this.exitLink = data.exitLink;
    this.firstTime = data.firstTime;
    this.chest = data.chest;
  }

  /**
   * Returns a plain data object representation of the Map instance.
   * This is used for serialization, especially when sending data to the backend.
   * @returns A ModifiedMap object.
   */
  public toJSON(): ModifiedMap {
    return {
      personalID: this.personalID,
      map: this.map,
      modifiedCells: this.modifiedCells,
      exitLink: this.exitLink,
      firstTime: this.firstTime,
      chest: this.chest,
    };
  }

  /**
   * Returns a new Map instance with updated cell data.
   * This is an immutable operation.
   * @param newCells The new array of cells to use.
   * @returns A new Map instance.
   */
  public withUpdatedCells(newCells: Cell[]): Map {
    const newMapData = { ...this.toJSON(), modifiedCells: newCells };
    return new Map(newMapData);
  }

  /**
   * Processes the map for the first time, adding chests and traps.
   * This is an immutable operation.
   * @returns A new, processed Map instance.
   */
  public processedForFirstTime(): Map {
    if (!this.firstTime) return this; // Return self if already processed

    const newCells = [...this.modifiedCells]; // Create a mutable copy

    const restrictedCells = [
      { row: 7, col: 4 },
      { row: 1, col: 4 },
      { row: 4, col: 7 },
      { row: 4, col: 1 },
    ];
    // Find floor cells for potential modification
    let floorCells = newCells.filter((cell) => cell.type === "floor");

    // filter out restricted cells
    floorCells = floorCells.filter(
      (cell: Cell) =>
        !restrictedCells.some(
          (restricted) =>
            restricted.row === cell.row && restricted.col === cell.col
        )
    );

    // Place a chest if the base map allows it and floor cells are available
    if (this.chest && floorCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * floorCells.length);
      const chestCell = floorCells[randomIndex];
      // Find the original cell in the newCells array to modify it
      const cellToUpdate = newCells.find(
        (c) => c.row === chestCell.row && c.col === chestCell.col
      );
      if (cellToUpdate) cellToUpdate.type = "chest";
    }

    // Randomly place traps on some of the remaining floor cells
    const exitPositions = Object.values(EXIT_POSITIONS);
    newCells.forEach((cell) => {
      const isExit = exitPositions.some(
        (p) => p.row === cell.row && p.col === cell.col
      );
      if (cell.type === "floor" && !isExit && Math.random() < 0.2) {
        cell.type = "trap";
      }
    });

    const newMapData = {
      ...this.toJSON(),
      modifiedCells: newCells,
      firstTime: false, // Mark as processed
    };
    return new Map(newMapData);
  }

  /**
   * Returns a new Map instance with a specific cell selected.
   * This is an immutable operation.
   * @param selectedCell The cell to select.
   * @returns A new Map instance with the updated selection.
   */
  public withCellSelection(selectedCell: Cell): Map {
    const newCells = this.modifiedCells.map((c) => ({
      ...c,
      isSelected: c.row === selectedCell.row && c.col === selectedCell.col,
    }));
    return this.withUpdatedCells(newCells);
  }

  /**
   * Returns a new Map instance with all cells deselected.
   * This is an immutable operation.
   * @returns A new Map instance with no cells selected.
   */
  public withoutCellSelection(): Map {
    const newCells = this.modifiedCells.map((cell) => ({
      ...cell,
      isSelected: false,
    }));
    return this.withUpdatedCells(newCells);
  }

  /**
   * Returns a new Map instance with an updated exit link.
   * This is an immutable operation.
   * @param direction The direction of the exit to update.
   * @param mapId The ID of the map to link to.
   * @returns A new Map instance with the updated exit link.
   */
  public withExitLink(
    direction: "up" | "down" | "left" | "right",
    mapId: string
  ): Map {
    const newExitLink = { ...this.exitLink, [direction]: mapId };
    const newMapData = { ...this.toJSON(), exitLink: newExitLink };
    return new Map(newMapData);
  }

  /**
   * Creates a new Map instance from raw API data.
   * @param apiData The raw data for a room from the backend.
   * @returns A new Map instance.
   */
  public static fromAPIData(apiData: any): Map {
    const newMapData: ModifiedMap = {
      personalID: `player_${Date.now()}_${apiData._id}`,
      map: apiData._id,
      modifiedCells: apiData.cells,
      exitLink: { up: null, down: null, left: null, right: null },
      firstTime: true,
      chest: apiData.chest,
    };
    return new Map(newMapData);
  }

  /**
   * Creates a default 9x9 grid of floor cells.
   * @returns An array of default cells.
   */
  public static createDefaultCells(): Cell[] {
    return Array.from({ length: 81 }, (_, index) => ({
      row: Math.floor(index / 9),
      col: index % 9,
      type: "floor",
    }));
  }
}
