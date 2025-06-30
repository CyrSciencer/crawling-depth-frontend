import React, { useState, useEffect } from "react";
import { Cell, cellExit, levelBorder, ExitForm } from "../../types/cells";
import "./mapCreator.css";
import { ExitFormSelector } from "./ExitFormSelector";
import { CellTypeSelector } from "./CellTypeSelector";
import { ResourceSelector } from "./ResourceSelector";
import { RESOURCE_VALUES, ResourceType } from "../../config/resourceConfig";
import axios from "axios";

const nonModifiableCells = [
  { row: 4, col: 4 },
  { row: 7, col: 4 },
  { row: 1, col: 4 },
  { row: 4, col: 7 },
  { row: 4, col: 1 },
];

export const MapCreator: React.FC = () => {
  const [exitForm, setExitForm] = useState<ExitForm>("NESW");
  const [chest, setChest] = useState<boolean>(false);
  const [mapSaved, setMapSaved] = useState<boolean>(false);
  // Current modification parameters
  const [currentType, setCurrentType] = useState<Cell["type"]>("floor");
  const [currentResource, setCurrentResource] = useState<ResourceType>("stone");

  const createInitialCells = (form: ExitForm): Cell[] => {
    return Array.from({ length: 81 }, (_, index) => {
      const cell: Cell = {
        row: Math.floor(index / 9),
        col: index % 9,
        type: "floor",
      };
      const isNonModifiable = nonModifiableCells.some(
        (c) => c.row === cell.row && c.col === cell.col
      );
      if (isNonModifiable) {
        return cell;
      }
      return levelBorder(cellExit(cell, form));
    });
  };

  const [cells, setCells] = useState<Cell[]>(() =>
    createInitialCells(exitForm)
  );

  useEffect(() => {
    setCells(createInitialCells(exitForm));
  }, [exitForm]);

  const handleCellClick = (cell: Cell) => {
    const isNonModifiable = nonModifiableCells.some(
      (c) => c.row === cell.row && c.col === cell.col
    );
    if (isNonModifiable) {
      return;
    }
    // Update selection state
    const updatedCells = cells.map((c) => {
      if (c.row === cell.row && c.col === cell.col) {
        // Apply current modification parameters
        const updatedCell = { ...c, type: currentType };
        if (currentType === "wall") {
          updatedCell.resources = RESOURCE_VALUES[currentResource];
        } else {
          updatedCell.resources = undefined;
        }
        return updatedCell;
      }
      return { ...c, isSelected: false };
    });
    setCells(updatedCells);
  };
  const saveMap = async () => {
    const map = {
      name: `${exitForm}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      cells: cells,
      exits: {
        up: exitForm.includes("N"),
        down: exitForm.includes("S"),
        left: exitForm.includes("W"),
        right: exitForm.includes("E"),
      },
      chest: chest,
    };
    console.log(map);
    try {
      await axios
        .post(`http://localhost:3001/api/baseMap`, map)
        .then((response) => {
          console.log(response);
        });
      setMapSaved(true);
      setTimeout(() => {
        setMapSaved(false);
      }, 3000);
      setCells(createInitialCells(exitForm));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="game-board">
      <div className="map-creator-container">
        <div className="exit-form-selector-container">
          <h3>exit form</h3>
          <ExitFormSelector value={exitForm} onChange={setExitForm} />
        </div>
        <div className="cell-modifiers">
          <CellTypeSelector value={currentType} onChange={setCurrentType} />
          {currentType === "wall" && (
            <ResourceSelector
              resources={RESOURCE_VALUES[currentResource]}
              onChange={setCurrentResource}
            />
          )}
          <input type="checkbox" onChange={() => setChest(!chest)} />
          <span>chest</span>
        </div>
        <button onClick={() => saveMap()}>save map</button>
        {mapSaved && <span>map saved</span>}
      </div>
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
            onClick={() => {
              if (cell.type === "unbreakable") return;
              if (cell.type === "exit") return;
              handleCellClick(cell);
            }}
          />
        ))}
      </div>
    </div>
  );
};
