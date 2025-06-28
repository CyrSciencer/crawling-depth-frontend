import { useState, useEffect } from "react";
import { Cell, ExitForm } from "../types/cells";
import { Player, Position } from "../types/player";
import { createNewPlayer, getPlayerByCode } from "../utils/playerUtils";
import {
  loadPlayerMap,
  processFirstTimeMap,
  createDefaultCells,
} from "../utils/mapUtils";
import { updateCellSelection, clearCellSelection } from "../utils/cellUtils";
import {
  getExitDirection,
  generateNextRoom,
  getToNextRoom,
} from "../events/nextRoomEvent";

// GameBoard hook module loading logging | used for debugging module initialization
console.log("🎮 GameBoard hook module loaded");

// GameBoard hook props interface | used to define the expected props for the useGameBoard hook
interface UseGameBoardProps {
  player: Player | null;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  onCellsChange?: (cells: Cell[]) => void;
}

// Main GameBoard custom hook | used to manage all game board state and logic in a centralized location
export const useGameBoard = ({
  player,
  setPlayer,
  onCellsChange,
}: UseGameBoardProps) => {
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
  // Game cells state | used to store and manage the current state of all game board cells
  const [cells, setCells] = useState<Cell[]>(createDefaultCells());

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

  // Cell click handler | used to handle cell selection and update the game state
  const handleCellClick = (cell: Cell) => {
    const updatedCells = updateCellSelection(cells, cell);
    setCells(updatedCells);
    if (onCellsChange) {
      onCellsChange(updatedCells);
    }
    setSelectedCell(cell);
  };

  // Map loading effect | used to load and process the player's map when they change or the game starts
  useEffect(() => {
    if (player?.recoveryCode === 0) {
      return;
    }

    setChestPresent(0);
    const getBaseMap = async () => {
      try {
        // Player map data retrieval | used to fetch the player's current map from the backend
        const { playerData, mapToUse } = await loadPlayerMap(
          player?.recoveryCode! as number
        );

        // First-time map processing | used to initialize new maps with chests and traps
        if ((mapToUse as any).firstTime) {
          const processedCells = processFirstTimeMap(mapToUse, chestPresent);
          setCells(processedCells);
          setChestPresent(1);
        } else {
          // Existing map loading | used to load previously saved map data
          setCells((mapToUse as any).modifiedCells as Cell[]);
        }

        setPlayer(playerData);
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    getBaseMap();
  }, [exitForm, mapChanged, showGameBoard, player?.recoveryCode]);

  // Player position change effect | used to reset cell selection and update position when player moves
  useEffect(() => {
    if (player?.position) {
      setSelectedCell(null);
      const updatedCells = clearCellSelection(cells);
      setCells(updatedCells);
      if (onCellsChange) {
        onCellsChange(updatedCells);
      }
    }
  }, [player?.position]);
  const handleNewMap = () => {
    console.log("handleNewMap");
    if (player) {
      const checkForExit = async () => {
        console.log("checkForExit");
        try {
          const exitDirection = getExitDirection(player);

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

            const { currentMap } = player;
            const currentMapID = player.modifiedMaps.findIndex(
              (m: any) => m.personalID === currentMap
            );
            console.log("currentMapID", currentMapID);
            const newModifiedMaps = [...player.modifiedMaps];
            if ((newModifiedMaps[currentMapID] as any).exitLink[exitLinkage]) {
              return console.log("already linked");
            }
            const result = await generateNextRoom(exitDirection);
            console.log("result", result);
            if (result) {
              const { roomData } = result;
              console.log("exitDirection", exitDirection);

              console.log("Next room data:", roomData);

              console.log("currentMapID", currentMapID);
              const newModifiedMaps = [...player.modifiedMaps];

              console.log(
                "currentModifiedMaps",
                (newModifiedMaps[currentMapID] as any).exitLink
              );

              (newModifiedMaps[currentMapID] as any).exitLink[exitLinkage] = (
                roomData as any
              )._id;
              console.log("roomData", roomData);
              const newRoom = {
                personalID: `player_${Date.now()}_${roomData._id}`,
                map: roomData._id,
                modifiedCells: roomData.cells,
                exitLink: {
                  up: null,
                  down: null,
                  left: null,
                  right: null,
                },
                firstTime: true,
              };
              //link room data to current map
              (newRoom as any).exitLink[entranceLinkage] = (
                newModifiedMaps[currentMapID] as any
              ).map;
              console.log("newRoom", newRoom);

              newModifiedMaps.push(newRoom);
              console.log("newModifiedMaps", newModifiedMaps);
              const newPlayer = { ...player, modifiedMaps: newModifiedMaps };
              console.log("player map data", player.modifiedMaps);
              setPlayer(newPlayer);
            } else {
              console.log("No exit found");
            }
          } else {
            console.log("No exit found");
          }
        } catch (error) {
          // It's normal for this to have an error when not on an exit,
          // as nextRoomEvent returns null, and accessing roomData.cells fails.
          // The console.error can be removed if this is expected behavior.
          // console.error("Error checking for exit:", error);
        }
      };

      checkForExit();
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
    setCells,
    handleNewPlayer,
    handleGetPlayer,
    handleCellClick,
    handleNewMap,
  };
};
