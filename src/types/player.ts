import { Cell } from "./cells";
import { PlayerData, Position, Block, Resource } from "../models/Player";

// Re-exporting PlayerData as Player for compatibility with existing utility functions.
export type Player = PlayerData;

export enum Direction {
  UP = 360,
  RIGHT = 90,
  DOWN = 180,
  LEFT = 270,
}

// Constants for conversion
export const CELL_SIZE = 47.5; // Cell size in pixels
export const PLAYER_SIZE = 35; // Player size
export const PLAYER_MARGIN = CELL_SIZE - PLAYER_SIZE;

// Conversion functions
export const gridToPixel = (pos: Position) => ({
  x: pos.col * (CELL_SIZE + 2) + PLAYER_MARGIN,
  y: pos.row * (CELL_SIZE + 2) + PLAYER_MARGIN,
});

export const pixelToGrid = (x: number, y: number): Position => ({
  row: Math.round(y / CELL_SIZE),
  col: Math.round(x / CELL_SIZE),
});

// Direction utilities
export const getFacingCell = (
  position: Position,
  direction: Direction
): Position => {
  switch (direction) {
    case Direction.UP:
      return { row: position.row - 1, col: position.col };
    case Direction.RIGHT:
      return { row: position.row, col: position.col + 1 };
    case Direction.DOWN:
      return { row: position.row + 1, col: position.col };
    case Direction.LEFT:
      return { row: position.row, col: position.col - 1 };
  }
};
