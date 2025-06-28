import { Cell } from "../types/cells";

console.log("💎 Resource configuration module loaded");

export type ResourceType =
  | "stone"
  | "iron"
  | "silver"
  | "gold"
  | "tin"
  | "zinc"
  | "crystal"
  | "copper";

console.log("📋 Resource types defined:", [
  "stone",
  "iron",
  "silver",
  "gold",
  "tin",
  "zinc",
  "crystal",
  "copper",
]);

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

console.log(
  "📊 RESOURCE_TYPES array created with",
  RESOURCE_TYPES.length,
  "types"
);

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

console.log("💰 RESOURCE_VALUES configuration created");
console.log("📊 Resource values:", RESOURCE_VALUES);

console.log("✅ Resource configuration module fully loaded");
