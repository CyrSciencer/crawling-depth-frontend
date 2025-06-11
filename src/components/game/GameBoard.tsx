import React, { useState, useEffect } from "react";
import { Cell, cellExit, levelBorder, ExitForm } from "../../types/cells";
import "./GameBoard.css";
import axios from "axios";
import { PlayerSelection } from "./PlayerSelection";
import { Player } from "../../types/player";

interface GameBoardProps {
  onCellsChange?: (cells: Cell[]) => void;
  playerPosition?: { row: number; col: number };
  player: Player | null;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
}

const generateRecoveryCode = (): number => {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit number
};

export const GameBoard: React.FC<GameBoardProps> = ({
  onCellsChange,
  playerPosition,
  player,
  setPlayer,
}) => {
  const [showGameBoard, setShowGameBoard] = useState<boolean>(false);
  const [mapChanged, setMapChanged] = useState<boolean>(false);
  const [chestPresent, setChestPresent] = useState<number>(0);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [exitForm, setExitForm] = useState<ExitForm>("NESW");
  const [baseMap, setBaseMap] = useState<any>(null);
  const [cells, setCells] = useState<Cell[]>(
    Array.from({ length: 81 }, (_, index) => ({
      row: Math.floor(index / 9),
      col: index % 9,
      type: "floor",
    }))
  );

  const handleNewPlayer: () => Promise<void> = async () => {
    try {
      // Generate a unique recovery code
      const recoveryCode = generateRecoveryCode();

      // Check if code is already in use
      try {
        const { data: existingPlayer } = await axios.get(
          `http://localhost:3001/api/player/${recoveryCode}`
        );
        if (existingPlayer) {
          console.log("Code already in use, generating new one");
          return handleNewPlayer(); // Retry with new code
        }
      } catch (error) {
        // Code is not in use, proceed with player creation
        console.log("Creating new player");

        // Get base map
        const { data: baseMapData } = await axios.get(
          "http://localhost:3001/api/baseMap",
          {
            params: { exitForm },
          }
        );
        console.log("First base map loaded:", baseMapData);

        // Create initial player data
        const newPlayerData = {
          inventory: {
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
            blocks: {
              stoneBlock: 0,
              ironBlock: 0,
              silverBlock: 0,
              goldBlock: 0,
              tinBlock: 0,
              zincBlock: 0,
              crystalBlock: 0,
            },
            consumables: [],
            tools: {
              pickaxe: {
                charge: 100,
                power: 1,
                bonus: "none",
              },
            },
            equiped: {
              pickaxe: {
                charge: 100,
                power: 1,
                bonus: "none",
              },
            },
          },
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
            },
          ],
          position: {
            row: 4,
            col: 4,
          },
          currentMap: `player_${Date.now()}_${baseMapData._id}`,
          movementPerTurn: 3,
          health: 100,
          recoveryCode,
        };

        // Create player in database
        const { data: createdPlayer } = await axios.post(
          "http://localhost:3001/api/player",
          newPlayerData
        );

        // Update local state
        setPlayer(createdPlayer);
        setShowGameBoard(true);
      }
    } catch (error) {
      console.error("Error creating new player:", error);
    }
  };

  const handleGetPlayer = () => {
    // TODO: Implement get player logic
    setShowGameBoard(true);
  };

  useEffect(() => {
    setChestPresent(0);
    const getBaseMap = async () => {
      try {
        const { data: playerData } = await axios.get(
          `http://localhost:3001/api/player/${player?.recoveryCode}`
        );
        console.log("Map loaded:", playerData.modifiedMaps[0].modifiedCells);
        const mapToUse = playerData.modifiedMaps[0];
        // First collect all floor cells
        const floorCells = mapToUse.modifiedCells.filter(
          (cell: Cell) => cell.type === "floor"
        );

        // Randomly select one floor cell to be a chest if conditions are met
        if (mapToUse.chest && chestPresent < 1 && floorCells.length > 0) {
          const randomIndex = Math.floor(Math.random() * floorCells.length);
          floorCells[randomIndex].type = "chest";
          setChestPresent(1);
        }

        // Transform some floor cells into traps
        mapToUse.modifiedCells.forEach((cell: Cell) => {
          if (cell.type === "floor") {
            const randomness = Math.random();
            if (randomness < 0.2) {
              cell.type = "trap";
            }
          }
        });
        setCells(mapToUse.modifiedCells);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(
            "Failed to load base map:",
            error.response?.data || error.message
          );
        } else {
          console.error("Unexpected error:", error);
        }
      }
    };

    getBaseMap();
  }, [exitForm, mapChanged, showGameBoard, player?.recoveryCode]);

  // Reset selection when player moves
  useEffect(() => {
    if (playerPosition) {
      setSelectedCell(null);
      const updatedCells = cells.map((cell) => ({
        ...cell,
        isSelected: false,
      }));
      setCells(updatedCells);
      if (onCellsChange) {
        onCellsChange(updatedCells);
      }
    }
  }, [playerPosition]);

  const handleCellClick = (cell: Cell) => {
    // Reset all cells' selection state
    const updatedCells = cells.map((c) => ({
      ...c,
      isSelected: c.row === cell.row && c.col === cell.col,
    }));
    setCells(updatedCells);
    if (onCellsChange) {
      onCellsChange(updatedCells);
    }
    setSelectedCell(cell);
  };

  const renderCellInfo = () => {
    if (!selectedCell) return null;

    const resourceInfo = selectedCell.resources
      ? Object.entries(selectedCell.resources)
          .filter(([_, value]) => value && value > 0)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")
      : "";

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

  if (!showGameBoard) {
    return (
      <PlayerSelection
        onNewPlayer={handleNewPlayer}
        onGetPlayer={handleGetPlayer}
        recoveryCode={player?.recoveryCode as number}
      />
    );
  }

  return (
    <div className="game-board">
      <div className="grid-container">
        {cells.map((cell) => (
          <div
            key={`${cell.row}-${cell.col}`}
            className={`cell ${
              cell.isSelected
                ? "selected"
                : cell.type === "unbreakable"
                ? "unbreakable"
                : cell.type === "exit"
                ? "exit"
                : cell.type === "wall"
                ? "wall"
                : cell.type === "chest"
                ? "chest"
                : "floor"
            } ${
              cell.resources
                ? Object.entries(cell.resources)
                    .filter(([_, value]) => value === 9)
                    .map(([key]) => key)
                    .join(" ")
                : ""
            }`}
            onClick={() => handleCellClick(cell)}
          />
        ))}
      </div>
      {renderCellInfo()}
    </div>
  );
};
