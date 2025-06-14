import { Cell } from "../types/cells";

export type ResourceType =
  | "stone"
  | "iron"
  | "silver"
  | "gold"
  | "tin"
  | "zinc"
  | "crystal"
  | "copper";

export const RESOURCE_TYPES: ResourceType[] = [
  "stone",
  "iron",
  "silver",
  "gold",
  "tin",
  "zinc",
  "crystal",
  "copper",
];

export const RESOURCE_VALUES: Record<ResourceType, Cell["resources"]> = {
  stone: { stone: 2 },
  iron: { stone: 1, iron: 1 },
  silver: { stone: 1, silver: 1 },
  gold: { stone: 1, gold: 1 },
  tin: { stone: 1, tin: 1 },
  zinc: { stone: 1, zinc: 1 },
  crystal: { stone: 1, crystal: 1 },
  copper: { stone: 1, copper: 1 },
};
