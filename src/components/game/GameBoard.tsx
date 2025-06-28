import React, { useEffect, useState } from "react";
import { Cell } from "../../types/cells";
import "./GameBoard.css";
import { PlayerSelection } from "./PlayerSelection";
import { Player, Position } from "../../models/Player";
import { useGameBoard } from "../../hooks/useGameBoard";
import { getCellClassName, renderCellInfo } from "../../utils/cellUtils";

// GameBoard component module loading logging | used for debugging component initialization
console.log("🎮 GameBoard component module loaded");

// GameBoard component props interface | used to define the expected props for the GameBoard component
interface GameBoardProps {
  player: Player | null;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
}

// Main GameBoard component function | used to render the game grid and handle player interactions
export const GameBoard: React.FC<GameBoardProps> = ({ player, setPlayer }) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  // GameBoard component initialization logging | used for debugging component lifecycle
  console.log("🎮 GameBoard component initializing...");
  // Props validation logging | used for debugging to verify props are passed correctly
  const { position } = player as Player;
  console.log("📊 maps data", player?.modifiedMaps);

  // GameBoard state and handlers from custom hook | used to manage game board state and interactions
  const {
    showGameBoard,
    cells,
    handleNewPlayer,
    handleGetPlayer,
    handleNewMap,
  } = useGameBoard({
    player,
    setPlayer,
  });

  const handleCellClick = (cell: Cell) => {
    // If the same cell is clicked, deselect it. Otherwise, select the new cell.
    const cellToSelect =
      selectedCell &&
      selectedCell.row === cell.row &&
      selectedCell.col === cell.col
        ? null
        : cell;
    const newPlayer = player?.selectCell(cellToSelect);
    if (newPlayer) {
      setPlayer(newPlayer);
    }
    setSelectedCell(cellToSelect);
  };

  useEffect(() => {
    handleNewMap();
  }, [position]);
  console.log("player position", position);
  // Player selection screen conditional rendering | used to show player creation/selection when game board is not active
  if (!showGameBoard) {
    return (
      <PlayerSelection
        onNewPlayer={handleNewPlayer}
        onGetPlayer={handleGetPlayer}
        recoveryCode={player?.recoveryCode as number}
      />
    );
  }

  // Main game board JSX structure | used to render the game grid and cell information
  return (
    <div className="game-board">
      {/* Game grid container | used to display the 9x9 grid of cells */}
      <div className="grid-container">
        {/* Cell mapping and rendering | used to render each individual cell with proper styling and click handlers */}
        {cells.map((cell) => (
          <div
            key={`${cell.row}-${cell.col}`}
            className={`cell ${getCellClassName(cell)}`}
            onClick={() => handleCellClick(cell)}
          />
        ))}
      </div>
      {/* Cell information display | used to show details about the currently selected cell */}
      {renderCellInfo(selectedCell)}
    </div>
  );
};
