import { EXIT_FORMS, ExitForm } from "../types/cells";
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

export const generateNextRoom = async (
  exitDirection: "N" | "E" | "S" | "W"
): Promise<{ roomData: any; exitDirection: "N" | "E" | "S" | "W" }> => {
  console.log(`exit to the ${exitDirection.toLowerCase()}`);
  const requiredExit = oppositeExit[exitDirection] as "N" | "E" | "S" | "W";
  const nextExitForm = getRandomNextExitForm(requiredExit);
  const roomData = await getNextRoom(nextExitForm);
  return { roomData, exitDirection };
};
