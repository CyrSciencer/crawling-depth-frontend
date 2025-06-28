import { Player } from "../types/player";
import { EXIT_POSITIONS, EXIT_FORMS, ExitForm, Cell } from "../types/cells";
import axios from "axios";

const getNextRoom = async (exitForm: string) => {
  console.log("getNextRoom", exitForm);
  const { data: baseMapData } = await axios.get(
    "http://localhost:3001/api/baseMap",
    {
      params: { exitForm },
    }
  );
  return baseMapData;
};

export const getExitEventDetails = (
  player: Player
): { row: number; col: number } | null => {
  const { position } = player;

  const isAtExit = Object.values(EXIT_POSITIONS).some(
    (exitPos) => exitPos.row === position.row && exitPos.col === position.col
  );

  return isAtExit ? position : null;
};

const allExitForms = [
  EXIT_FORMS.FOUR_EXITS.value,
  ...EXIT_FORMS.THREE_EXITS.map((f) => f.value),
  ...EXIT_FORMS.TWO_EXITS.map((f) => f.value),
  ...EXIT_FORMS.ONE_EXIT.map((f) => f.value),
];

const getRandomNextExitForm = (
  requiredExit: "N" | "E" | "S" | "W"
): ExitForm => {
  console.log("getRandomNextExitForm", requiredExit);
  const validForms = allExitForms.filter((form) => form.includes(requiredExit));
  const randomIndex = Math.floor(Math.random() * validForms.length);
  return validForms[randomIndex] as ExitForm;
};

const oppositeExit = {
  N: "S",
  E: "W",
  S: "N",
  W: "E",
};

export const getExitDirection = (
  player: Player
): "N" | "E" | "S" | "W" | null => {
  const exitPosition = getExitEventDetails(player);
  if (!exitPosition) {
    return null;
  }

  const exitDirection = (
    Object.keys(EXIT_POSITIONS) as Array<keyof typeof EXIT_POSITIONS>
  ).find(
    (dir) =>
      EXIT_POSITIONS[dir].row === exitPosition.row &&
      EXIT_POSITIONS[dir].col === exitPosition.col
  );

  return exitDirection || null;
};

export const generateNextRoom = async (
  exitDirection: "N" | "E" | "S" | "W"
): Promise<{ roomData: any; exitDirection: "N" | "E" | "S" | "W" }> => {
  console.log(`exit to the ${exitDirection.toLowerCase()}`);
  const requiredExit = oppositeExit[exitDirection] as "N" | "E" | "S" | "W";
  const nextExitForm = getRandomNextExitForm(requiredExit);
  const roomData = await getNextRoom(nextExitForm);
  return { roomData, exitDirection };
};
export const getToNextRoom = async (
  player: Player,
  setCells: (cells: Cell[]) => void,
  setPlayer: (player: Player) => void
) => {
  const { position, currentMap, modifiedMaps } = player;
  let exitDirection: string = " ";
  let newPlayerPosition = {
    row: 0,
    col: 0,
  };
  if (position.row === 0) {
    exitDirection = "up";
    newPlayerPosition.row = 9;
  } else if (position.row === 9) {
    exitDirection = "down";
    newPlayerPosition.row = 0;
  } else if (position.col === 0) {
    exitDirection = "left";
    newPlayerPosition.col = 9;
  } else if (position.col === 9) {
    exitDirection = "right";
    newPlayerPosition.col = 0;
  }
  console.log("exitDirection", exitDirection);
  const currentMapData = modifiedMaps.find(
    (map) => (map as any).personalID === currentMap
  );
  console.log("currentMapData", currentMapData);
  const nextRoom = (currentMapData as any).exitLink[exitDirection];
  console.log("nextRoom", nextRoom);
  const nextRoomData = modifiedMaps.find(
    (map) => (map as any).map === nextRoom
  );
  console.log("nextRoomData", nextRoomData);
  setCells((nextRoomData as any).modifiedCells);
  setPlayer({
    ...player,
    position: newPlayerPosition,
    currentMap: (nextRoomData as any).personalID,
  });
};
