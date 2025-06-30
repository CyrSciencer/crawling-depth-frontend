import { Direction, gridToPixel, getFacingCell } from "../../types/player";
import {
  Position,
  Inventory,
  Tool,
  Block,
  PlayerData,
  Resource,
} from "../../models/PlayerModel";
import { Cell } from "../../types/cells";
import { useRef, useState, useEffect } from "react";
import "./PlayerPawn.css";
import { canMoveToCell } from "../../utils/cellUtils";
import { Player } from "../../models/PlayerModel";
import { log } from "console";

interface PlayerPawnProps {
  position: Position;
  onPositionChange: (newPosition: Position) => void;
  cells: Cell[];
  onCellSelect?: (cell: Cell | null) => void;
  onShowInfo?: (show: boolean) => void;
  player: Player;
  onPlayerChange: (player: Player) => void;
}

const PlayerPawn: React.FC<PlayerPawnProps> = ({
  position,
  onPositionChange,
  cells,
  onCellSelect,
  onShowInfo,
  player,
  onPlayerChange,
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

    // Use the new Player class methods to check for possible actions
    if (player.canMine(cell)) {
      setActionType("mine");
      setShowActionPopup(true);
      return;
    }

    if (player.canPlaceBlock(cell)) {
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
    if (!facingCell) return;

    const cell = getCellAtPosition(facingCell);
    if (!cell) return;

    switch (actionType) {
      case "mine": {
        let newPlayer = player.mine(cell);
        const newCells = cells.map((c) =>
          c.row === cell.row && c.col === cell.col
            ? { ...c, type: "floor" as Cell["type"], resources: undefined }
            : c
        );
        console.log("mine");
        newPlayer = newPlayer.updateCurrentMap(newCells);
        onPlayerChange(newPlayer);
        break;
      }
      case "place": {
        const { newPlayer, blockType } = player.placeBlock(cell);

        console.log("blockType", blockType);
        if (newPlayer !== player && blockType) {
          console.log("place");
          const resourceType = blockType.replace("Block", "") as keyof Resource;
          const newCells = cells.map((c) => {
            if (c.row === cell.row && c.col === cell.col) {
              const newResources: Resource = {
                stone: 0, // Ensure the base property is present
                [resourceType]: 9,
              };
              return {
                ...c,
                type: "wall" as Cell["type"],
                resources: newResources,
              };
            }
            return c;
          });
          const finalPlayer = newPlayer.updateCurrentMap(newCells);
          onPlayerChange(finalPlayer);
        }
        break;
      }
      case "chest": {
        let { newPlayer, reward } = player.openChest();
        if (reward) {
          console.log("You found:", reward.name, reward.value);
        }
        const newCells = cells.map((c) =>
          c.row === cell.row && c.col === cell.col
            ? { ...c, type: "floor" as Cell["type"] }
            : c
        );
        newPlayer = newPlayer.updateCurrentMap(newCells);
        onPlayerChange(newPlayer);
        break;
      }
      default:
        console.log("No action to perform.");
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
  }, [position, onPositionChange, cells, rotation, onShowInfo, onCellSelect]);

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
