import { useState, useEffect } from "react";
import { Cell, ExitForm } from "../types/cells";
import { Player } from "../models/Player";
import { createNewPlayer, getPlayerByCode } from "../utils/playerUtils";
import {
  loadPlayerMap,
  processFirstTimeMap,
  createDefaultCells,
} from "../utils/mapUtils";
import { clearCellSelection } from "../utils/cellUtils";
import { generateNextRoom } from "../events/nextRoomEvent";

// GameBoard hook module loading logging | used for debugging module initialization
console.log("🎮 GameBoard hook module loaded");

// GameBoard hook props interface | used to define the expected props for the useGameBoard hook
interface UseGameBoardProps {
  player: Player | null;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
}

// Main GameBoard custom hook | used to manage all game board state and logic in a centralized location
export const useGameBoard = ({ player, setPlayer }: UseGameBoardProps) => {
  // Game board visibility state | used to control when to show the game board vs player selection
  const [showGameBoard, setShowGameBoard] = useState<boolean>(false);
  // Map change tracking state | used to trigger map reloading when needed
  const [mapChanged, setMapChanged] = useState<boolean>(false);
  // Chest presence tracking state | used to track if a chest has been placed on the current map
  const [chestPresent, setChestPresent] = useState<number>(0);
  // Selected cell state | used to track which cell is currently selected by the player
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  // Exit form state | used to determine the layout of exits on the map
  const [exitForm, setExitForm] = useState<ExitForm>("NESW");

  // Derive cells from player state - SINGLE SOURCE OF TRUTH
  const cells = player?.getCurrentMap()?.modifiedCells || createDefaultCells();

  // New player creation handler | used to create a new player and initialize the game board
  const handleNewPlayer = async (): Promise<void> => {
    try {
      const createdPlayer = await createNewPlayer(exitForm);
      setPlayer(createdPlayer);
      setShowGameBoard(true);
    } catch (error) {
      console.error("Error creating new player:", error);
    }
  };

  // Existing player retrieval handler | used to load an existing player and their game state
  const handleGetPlayer = async (recoveryCode: number) => {
    try {
      const playerData = await getPlayerByCode(recoveryCode);
      setPlayer(playerData);
      setShowGameBoard(true);
    } catch (error) {
      console.error("Error getting player:", error);
    }
  };

  // Map loading effect | used to load and process the player's map when they change or the game starts
  useEffect(() => {
    if (!player || player.recoveryCode === 0) {
      return;
    }

    setChestPresent(0);
    const getBaseMap = async () => {
      try {
        // Player map data retrieval | used to fetch the player's current map from the backend
        const { player: fetchedPlayer, mapToUse } = await loadPlayerMap(
          player.recoveryCode as number
        );

        // First-time map processing | used to initialize new maps with chests and traps
        if ((mapToUse as any).firstTime) {
          const processedCells = processFirstTimeMap(mapToUse, chestPresent);
          const updatedPlayer = fetchedPlayer.updateCurrentMap(processedCells);
          setPlayer(updatedPlayer);
          setChestPresent(1);
        } else {
          setPlayer(fetchedPlayer);
        }
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    getBaseMap();
  }, [mapChanged, showGameBoard, player?.recoveryCode]);

  // Player position change effect | used to reset cell selection and update position when player moves
  useEffect(() => {
    if (player?.position) {
      setSelectedCell(null);
      // Deselect all cells when player moves
      const newPlayer = player.selectCell(null);
      if (newPlayer !== player) {
        setPlayer(newPlayer);
      }
    }
  }, [player?.position]);
  const handleNewMap = () => {
    if (player) {
      const simplifiedExitCheck = async () => {
        try {
          const newPlayer = await player.discoverNewRoom();
          // The discoverNewRoom method returns the same player instance if no changes are made.
          // We only update the state if a new instance is returned.
          if (newPlayer !== player) {
            setPlayer(newPlayer);
          }
        } catch (error) {
          console.error("Error during room discovery:", error);
        }
      };

      simplifiedExitCheck();
    }
  };

  // Hook return object | used to expose all state and handlers to the component using this hook
  return {
    showGameBoard,
    setShowGameBoard,
    mapChanged,
    setMapChanged,
    chestPresent,
    setChestPresent,
    selectedCell,
    setSelectedCell,
    exitForm,
    setExitForm,
    cells,
    handleNewPlayer,
    handleGetPlayer,
    handleNewMap,
  };
};
