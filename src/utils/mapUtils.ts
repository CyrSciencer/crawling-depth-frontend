import { Cell } from "../types/cells";
import { PlayerData, Player } from "../models/PlayerModel";
import axios from "axios";

// Map utilities module loading logging | used for debugging module initialization
console.log("🗺️ Map utilities module loaded");

// First-time map processing function | used to initialize a map with chests and traps for new players
export const processFirstTimeMap = (mapToUse: any, chestPresent: number) => {
  // Floor cells collection | used to identify all floor cells that can be modified
  const floorCells = mapToUse.modifiedCells.filter(
    (cell: Cell) => cell.type === "floor"
  );

  // Chest placement logic | used to randomly place a chest on a floor cell if conditions are met
  if (mapToUse.chest && chestPresent < 1 && floorCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * floorCells.length);
    floorCells[randomIndex].type = "chest";
  }

  // Trap generation logic | used to randomly convert 20% of floor cells into traps
  mapToUse.modifiedCells.forEach((cell: Cell) => {
    if (cell.type === "floor") {
      const randomness = Math.random();
      if (randomness < 0.2) {
        cell.type = "trap";
      }
    }
  });

  // First-time flag update | used to mark the map as no longer being first-time
  mapToUse.firstTime = false;
  return mapToUse.modifiedCells;
};

// Player map loading function | used to fetch and prepare a player's map data from the backend
export const loadPlayerMap = async (recoveryCode: number) => {
  try {
    // Player data retrieval | used to fetch the complete player data from the backend
    const { data: playerData } = await axios.get(
      `http://localhost:3001/api/player/${recoveryCode}`
    );
    const player = new Player(playerData);

    // Current map finding | used to locate the player's current map from their data
    const mapToUse = player.getCurrentMap();
    if (!mapToUse) {
      throw new Error("Map not found");
    }

    return { player, mapToUse };
  } catch (error) {
    // Error handling and logging | used to provide detailed error information for debugging
    if (axios.isAxiosError(error)) {
      console.error(
        "Failed to load base map:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};
