import React, { useState, useEffect } from "react";
import { Cell, cellExit, levelBorder, ExitForm } from "../../types/cells";
import "./GameBoard.css";

interface GameBoardProps {
  onCellsChange?: (cells: Cell[]) => void;
  playerPosition?: { row: number; col: number };
}

export const GameBoard: React.FC<GameBoardProps> = ({
  onCellsChange,
  playerPosition,
}) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [exitForm, setExitForm] = useState<ExitForm>("NESW"); // Default to 4 exits
  const [cells, setCells] = useState<Cell[]>(
    Array.from({ length: 81 }, (_, index) => ({
      row: Math.floor(index / 9),
      col: index % 9,
      type: "floor",
    }))
  );

  useEffect(() => {
    const updatedCells = cells.map((cell) => {
      // Chain the cell modifications
      return levelBorder(cellExit(cell, exitForm));
    });
    setCells(updatedCells);
    if (onCellsChange) {
      onCellsChange(updatedCells);
    }
  }, [exitForm]); // Re-run when exit form changes

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
