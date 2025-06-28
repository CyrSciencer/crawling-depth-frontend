import axios from "axios";
import { PlayerData } from "../models/Player";
import { ExitForm } from "../types/cells";

// Player utilities module loading logging | used for debugging module initialization
console.log("👤 Player utilities module loaded");

// Recovery code generation function | used to create unique 6-digit codes for player identification
export const generateRecoveryCode = (): number => {
  console.log("🔢 Generating recovery code...");
  const code = Math.floor(100000 + Math.random() * 900000); // 6-digit number
  console.log("✅ Recovery code generated:", code);
  return code;
};

// Initial player data creation function | used to create the default player structure with empty inventory and starting position
export const createInitialPlayerData = (
  baseMapData: any,
  recoveryCode: number,
  exitForm: ExitForm
) => {
  return {
    // Player inventory initialization | used to set up empty inventory with default tools
    inventory: {
      // Resource initialization | used to set all resource counts to zero
      resources: {
        stone: 0,
        iron: 0,
        silver: 0,
        gold: 0,
        tin: 0,
        zinc: 0,
        crystal: 0,
        copper: 0,
      },
      // Block initialization | used to set all block counts to zero
      blocks: {
        stoneBlock: 0,
        ironBlock: 0,
        silverBlock: 0,
        goldBlock: 0,
        tinBlock: 0,
        zincBlock: 0,
        crystalBlock: 0,
      },
      // Consumables initialization | used to set empty consumables array
      consumables: [],
      // Tools initialization | used to set up default pickaxe with full charge
      tools: {
        pickaxe: {
          charge: 100,
          power: 1,
          bonus: "none",
        },
      },
      // Equipped items initialization | used to set default equipped pickaxe
      equiped: {
        pickaxe: {
          charge: 100,
          power: 1,
          bonus: "none",
        },
      },
    },
    // Modified maps initialization | used to set up the player's first map with base map data
    modifiedMaps: [
      {
        personalID: `player_${Date.now()}_${baseMapData._id}`,
        map: baseMapData._id,
        modifiedCells: baseMapData.cells,
        exitLink: {
          up: null,
          down: null,
          left: null,
          right: null,
        },
        firstTime: true,
      },
    ],
    // Player position initialization | used to set starting position at center of map
    position: {
      row: 4,
      col: 4,
    },
    // Current map reference | used to track which map the player is currently on
    currentMap: `player_${Date.now()}_${baseMapData._id}`,
    // Movement and health initialization | used to set default movement and health values
    movementPerTurn: 3,
    health: 100,
    recoveryCode,
  };
};

// Recovery code existence check function | used to verify if a recovery code is already in use
export const checkRecoveryCodeExists = async (
  recoveryCode: number
): Promise<boolean> => {
  try {
    const { data: existingPlayer } = await axios.get(
      `http://localhost:3001/api/player/${recoveryCode}`
    );
    return !!existingPlayer;
  } catch (error) {
    return false; // Code is not in use
  }
};

// New player creation function | used to create a new player with unique recovery code and initial data
export const createNewPlayer = async (
  exitForm: ExitForm
): Promise<PlayerData> => {
  // Recovery code generation loop | used to ensure unique recovery code generation
  let recoveryCode: number;
  let isCodeInUse: boolean;

  do {
    recoveryCode = generateRecoveryCode();
    isCodeInUse = await checkRecoveryCodeExists(recoveryCode);
  } while (isCodeInUse);

  console.log("Creating new player with code:", recoveryCode);

  // Base map retrieval | used to get the initial map data for the new player
  const { data: baseMapData } = await axios.get(
    "http://localhost:3001/api/baseMap",
    {
      params: { exitForm },
    }
  );
  console.log("First base map loaded:", baseMapData);

  // Player data creation | used to create the complete player data structure
  const newPlayerData = createInitialPlayerData(
    baseMapData,
    recoveryCode,
    exitForm
  );

  // Database player creation | used to save the new player to the backend database
  const { data: createdPlayer } = await axios.post(
    "http://localhost:3001/api/player",
    newPlayerData
  );

  return createdPlayer;
};

// Player retrieval function | used to fetch player data by recovery code from the backend
export const getPlayerByCode = async (
  recoveryCode: number
): Promise<PlayerData> => {
  const { data: playerData } = await axios.get(
    `http://localhost:3001/api/player/${recoveryCode}`
  );
  return playerData;
};
