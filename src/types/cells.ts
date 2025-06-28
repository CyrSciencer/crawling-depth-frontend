export interface Cell {
  row: number;
  col: number;
  type: "floor" | "wall" | "exit" | "unbreakable" | "chest" | "trap";
  isSelected?: boolean;
  resources?: {
    stone: number;
    iron?: number;
    silver?: number;
    gold?: number;
    tin?: number;
    zinc?: number;
    crystal?: number;
    copper?: number;
  };
}

// Exit positions
export const EXIT_POSITIONS = {
  N: { row: 0, col: 4 },
  E: { row: 4, col: 8 },
  S: { row: 8, col: 4 },
  W: { row: 4, col: 0 },
} as const;

// Exit form types
export type ExitForm =
  | "NESW" // 4 exits
  | "NES"
  | "NEW"
  | "NSW"
  | "ESW" // 3 exits
  | "NE"
  | "NS"
  | "NW"
  | "ES"
  | "EW"
  | "SW" // 2 exits
  | "N"
  | "E"
  | "S"
  | "W"; // 1 exit

// Exit form configurations
export const EXIT_FORMS = {
  FOUR_EXITS: {
    value: "NESW",
    label: "North East South West",
  },
  THREE_EXITS: [
    { value: "NES", label: "North East South" },
    { value: "NEW", label: "North East West" },
    { value: "NSW", label: "North South West" },
    { value: "ESW", label: "East South West" },
  ],
  TWO_EXITS: [
    { value: "NE", label: "North East" },
    { value: "NS", label: "North South" },
    { value: "NW", label: "North West" },
    { value: "ES", label: "East South" },
    { value: "EW", label: "East West" },
    { value: "SW", label: "South West" },
  ],
  ONE_EXIT: [
    { value: "N", label: "North" },
    { value: "E", label: "East" },
    { value: "S", label: "South" },
    { value: "W", label: "West" },
  ],
} as const;

export const cellWall = (cell: Cell): Cell => {
  return {
    ...cell,
    type: "wall",
  };
};

export const cellExit = (cell: Cell, exitForm: ExitForm): Cell => {
  // Check if the cell is at any of the exit positions specified in the form
  const isExit = Object.entries(EXIT_POSITIONS).some(
    ([direction, pos]) =>
      exitForm.includes(direction) &&
      cell.row === pos.row &&
      cell.col === pos.col
  );

  return isExit ? { ...cell, type: "exit" } : cell;
};

export const levelBorder = (cell: Cell): Cell => {
  // If it's an exit cell, don't make it unbreakable
  if (cell.type === "exit") return cell;

  // Check if the cell is on the border (excluding exit positions)
  const isBorder = Object.values(EXIT_POSITIONS).some(
    (pos) =>
      (cell.row === 0 && cell.col !== pos.col) || // North border
      (cell.col === 8 && cell.row !== pos.row) || // East border
      (cell.row === 8 && cell.col !== pos.col) || // South border
      (cell.col === 0 && cell.row !== pos.row) // West border
  );

  return isBorder ? { ...cell, type: "unbreakable" } : cell;
};

export const makeCellSelectable = (cell: Cell): Cell => ({
  ...cell,
  isSelected: true,
});
