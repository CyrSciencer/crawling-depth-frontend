import {
  Position,
  Direction,
  gridToPixel,
  getFacingCell,
  canMoveToCell,
  mineCell,
} from "../../types/player";
import Player from "../../types/player";
import { Cell } from "../../types/cells";
import { useRef, useState, useEffect } from "react";
import "./PlayerPawn.css";

interface Block {
  stoneBlock?: number;
  ironBlock?: number;
  silverBlock?: number;
  goldBlock?: number;
  tinBlock?: number;
  zincBlock?: number;
  crystalBlock?: number;
}

interface PlayerPawnProps {
  position: Position;
  onPositionChange: (newPosition: Position) => void;
  cells: Cell[];
  onCellSelect?: (cell: Cell | null) => void;
  onShowInfo?: (show: boolean) => void;
  player: Player;
  onCellsChange: (cells: Cell[]) => void;
  onBlockUse: () => void;
}

const PlayerPawn: React.FC<PlayerPawnProps> = ({
  position,
  onPositionChange,
  cells,
  onCellSelect,
  onShowInfo,
  player,
  onCellsChange,
  onBlockUse,
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<Direction>(Direction.RIGHT);
  const [pendingMovement, setPendingMovement] = useState<Position | null>(null);

  // Function to get cell at a position
  const getCellAtPosition = (pos: Position): Cell | undefined => {
    return cells.find((cell) => cell.row === pos.row && cell.col === pos.col);
  };

  // Function to get direction from key
  const getDirectionFromKey = (key: string): Direction | null => {
    switch (key) {
      case "ArrowUp":
        return Direction.UP;
      case "ArrowRight":
        return Direction.RIGHT;
      case "ArrowDown":
        return Direction.DOWN;
      case "ArrowLeft":
        return Direction.LEFT;
      default:
        return null;
    }
  };

  const handleAction = () => {
    const facingCell = getFacingCell(position, rotation);
    const cell = getCellAtPosition(facingCell);

    if (cell) {
      if (cell.type === "wall") {
        mineCell(cell, player);
        onCellsChange([...cells]);
      } else if (cell.type === "floor") {
        // Vérifier si un bloc est équipé
        const blockType = Object.keys(player.inventory.equiped || {}).find(
          (key) => key.endsWith("Block")
        );

        if (
          blockType &&
          player.inventory.equiped &&
          blockType in player.inventory.equiped
        ) {
          // Convertir le type de bloc en type de ressource (ex: stoneBlock -> stone)
          const resourceType = (blockType as string).replace(
            "Block",
            ""
          ) as keyof Cell["resources"];

          // Mettre à jour la cellule
          cell.type = "wall";
          cell.resources = {
            stone: 0,
            [resourceType]: 9,
          };

          // Décrémenter le bloc équipé
          const equippedBlock = player.inventory.equiped as Block;
          equippedBlock[blockType as keyof Block] =
            (equippedBlock[blockType as keyof Block] || 0) - 1;

          // Mettre à jour la grille
          onCellsChange([...cells]);
          // Notifier l'utilisation du bloc
          onBlockUse();
        }
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent page scrolling
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
          event.key
        )
      ) {
        event.preventDefault();
      }

      if (event.key === " ") {
        handleAction();
        return;
      }

      const direction = getDirectionFromKey(event.key);
      if (!direction) return;

      if (onShowInfo) onShowInfo(false);
      if (onCellSelect) onCellSelect(null);

      // If player is not already facing the right direction
      if (rotation !== direction) {
        // Rotate player
        setRotation(direction);
        // Calculate and store potential position
        const facingCell = getFacingCell(position, direction);
        if (canMoveToCell(getCellAtPosition(facingCell))) {
          setPendingMovement(facingCell);
        }
      } else {
        // If player is already facing the right direction, check for pending movement
        if (pendingMovement) {
          onPositionChange(pendingMovement);
          setPendingMovement(null);
        } else {
          // Otherwise, calculate and perform movement directly
          const facingCell = getFacingCell(position, direction);
          if (canMoveToCell(getCellAtPosition(facingCell))) {
            onPositionChange(facingCell);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    position,
    onPositionChange,
    cells,
    rotation,
    pendingMovement,
    onShowInfo,
    onCellSelect,
    onCellsChange,
  ]);

  const pixelPosition = gridToPixel(position);

  return (
    <div
      ref={playerRef}
      className={`player direction-${rotation}`}
      style={
        {
          "--player-x": `${pixelPosition.x}px`,
          "--player-y": `${pixelPosition.y}px`,
          "--player-rotation": `${rotation}deg`,
        } as React.CSSProperties
      }
    >
      <div className="player-front" />
    </div>
  );
};

export default PlayerPawn;
