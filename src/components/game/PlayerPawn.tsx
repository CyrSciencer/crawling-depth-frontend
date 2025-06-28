import {
  Position,
  Direction,
  gridToPixel,
  getFacingCell,
  canMoveToCell,
  mineCell,
  placeBlock,
} from "../../types/player";
import Player from "../../types/player";
import { Cell } from "../../types/cells";
import { useRef, useState, useEffect } from "react";
import "./PlayerPawn.css";
import { Inventory, Tool } from "../../types/player";
import { chestEvent } from "../../events/chestEvent";

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
  onInventoryChange: (inventory: Inventory) => void;
}

const PlayerPawn: React.FC<PlayerPawnProps> = ({
  position,
  onPositionChange,
  cells,
  onCellSelect,
  onShowInfo,
  player,
  onCellsChange,
  onInventoryChange,
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<Direction>(Direction.RIGHT);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });
  const [actionType, setActionType] = useState<string>("");

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

  const checkPossibleAction = () => {
    const facingCell = getFacingCell(position, rotation);
    const cell = getCellAtPosition(facingCell);

    console.log("Checking possible action:", {
      facingCell,
      cell,
      equipped: player.inventory.equiped,
    });

    if (!cell) {
      setShowActionPopup(false);
      return;
    }

    // Calculer la position du pop-up basée sur la position du joueur
    const popupX = position.col * 47.5 + 37;
    const popupY = position.row * 47.5 - 37;
    setActionPosition({ x: popupX, y: popupY });

    // Vérifier les équipements du joueur
    const equippedItems = player.inventory.equiped || {};

    // Vérifier si le joueur a une pioche équipée et fait face à un mur
    if (
      cell.type === "wall" &&
      "pickaxe" in equippedItems &&
      equippedItems.pickaxe !== undefined &&
      equippedItems.pickaxe.charge > 0
    ) {
      console.log("Can mine wall");
      setActionType("mine");
      setShowActionPopup(true);
      return;
    }

    // Vérifier si le joueur a un bloc équipé et fait face à un sol

    if (
      cell.type === "floor" &&
      player.inventory.equiped !== null &&
      "block" in player.inventory.equiped
    ) {
      setActionType("place");
      setShowActionPopup(true);
      return;
    }
    //check if the cell is a chest
    if (cell.type === "chest") {
      setActionType("chest");
      setShowActionPopup(true);
      return;
    }

    console.log("No action possible");
    setShowActionPopup(false);
  };

  // Appeler checkPossibleAction à chaque changement de position ou rotation
  useEffect(() => {
    checkPossibleAction();
  }, [position, rotation, player.inventory.equiped]);

  const handleAction = () => {
    const facingCell = getFacingCell(position, rotation);
    const cell = getCellAtPosition(facingCell);

    if (cell) {
      if (cell.type === "wall") {
        mineCell(cell, player);
        onCellsChange([...cells]);
        if (
          player.inventory.equiped &&
          "pickaxe" in player.inventory.equiped &&
          player.inventory.equiped.pickaxe &&
          player.inventory.tools?.pickaxe &&
          player.inventory.tools.pickaxe.charge > 0
        ) {
          const pickaxe = player.inventory.equiped.pickaxe;
          const toolsPickaxe = player.inventory.tools.pickaxe;

          onInventoryChange({
            ...player.inventory,
            equiped: {
              ...player.inventory.equiped,
              pickaxe: {
                ...pickaxe,
                charge: pickaxe.charge - 1,
              },
            },
            tools: {
              ...player.inventory.tools,
              pickaxe: {
                ...toolsPickaxe,
                charge: toolsPickaxe.charge - 1,
              },
            },
          });
        }
      } else if (cell.type === "floor") {
        placeBlock(cell, player);
        onCellsChange([...cells]);
      } else if (cell.type === "chest") {
        chestEvent(cell, player);
        onCellsChange([...cells]);
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

      // Rotation toujours possible
      if (rotation !== direction) {
        setRotation(direction);
      }

      // Déplacement uniquement si la cellule en face est valide
      const facingCell = getFacingCell(position, direction);
      if (canMoveToCell(getCellAtPosition(facingCell))) {
        onPositionChange(facingCell);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    position,
    onPositionChange,
    cells,
    rotation,
    onShowInfo,
    onCellSelect,
    onCellsChange,
  ]);

  const pixelPosition = gridToPixel(position);

  return (
    <div className="player-pawn">
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

      {showActionPopup && (
        <div
          className="action-popup"
          style={{
            position: "absolute",
            left: `${actionPosition.x}px`,
            top: `${actionPosition.y}px`,
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            zIndex: 1000,
            pointerEvents: "none", // Empêche le pop-up d'interférer avec les clics
          }}
        >
          {actionType === "mine"
            ? "Mine Wall"
            : actionType === "place"
            ? "Place Block"
            : actionType === "chest"
            ? "Open Chest"
            : "No Action"}
        </div>
      )}
    </div>
  );
};

export default PlayerPawn;
