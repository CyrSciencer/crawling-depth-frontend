import React, { useState, useEffect } from "react";
import { Cell, cellExit, levelBorder, ExitForm } from "../types/cells";
import "./GameBoard.css";

export const GameBoard: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [hoveredCell, setHoveredCell] = useState<Cell | null>(null);
  const [exitForm, setExitForm] = useState<ExitForm>("NESW"); // Default to 4 exits
  const [cells, setCells] = useState<Cell[]>(
    Array.from({ length: 81 }, (_, index) => ({
      row: Math.floor(index / 9),
      col: index % 9,
      type: "floor",
    }))
  );

  useEffect(() => {
    setCells(
      cells.map((cell) => {
        // Chain the cell modifications
        return levelBorder(cellExit(cell, exitForm));
      })
    );
  }, [exitForm]); // Re-run when exit form changes

  const handleCellClick = (cell: Cell) => {
    // Reset all cells' selection state
    const updatedCells = cells.map((c) => ({
      ...c,
      isSelected: c.row === cell.row && c.col === cell.col,
    }));
    setCells(updatedCells);
    setSelectedCell(cell);
  };

  const handleCellMouseEnter = (cell: Cell) => {
    setHoveredCell(cell);
  };

  const handleCellMouseLeave = () => {
    setHoveredCell(null);
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
            } `}
            onClick={() => handleCellClick(cell)}
            onMouseEnter={() => handleCellMouseEnter(cell)}
            onMouseLeave={handleCellMouseLeave}
          />
        ))}
      </div>
      {renderCellInfo()}
    </div>
  );
};
