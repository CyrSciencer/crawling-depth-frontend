import { ResourceType } from "./resourceConfig";
import { Consumable } from "../models/Player";
export enum ConsumableStats {
  HEALTH = "health",
  CHARGE = "charge",
  POWER = "power",
  BONUS = "bonus",
}

export interface ConsumableRecipe {
  name: ConsumableStats;
  recipe: {
    [key in ResourceType]: number;
  };
  quantity: number;
  craftTime: number;

  impact: number;
}

export const consumableRecipes: ConsumableRecipe[] = [
  {
    name: ConsumableStats.HEALTH,
    recipe: {
      stone: 0,
      iron: 0,
      silver: 0,
      gold: 0,
      tin: 0,
      zinc: 0,
      crystal: 0,
      copper: 3,
    },
    quantity: 1,
    craftTime: 1,
    impact: 10,
  },
  {
    name: ConsumableStats.HEALTH,
    recipe: {
      stone: 0,
      iron: 0,
      silver: 0,
      gold: 0,
      tin: 5,
      zinc: 0,
      crystal: 0,
      copper: 3,
    },
    quantity: 1,
    craftTime: 2,
    impact: 20,
  },
  {
    name: ConsumableStats.CHARGE,
    recipe: {
      stone: 0,
      iron: 5,
      silver: 0,
      gold: 0,
      tin: 0,
      zinc: 0,
      crystal: 1,
      copper: 0,
    },
    quantity: 1,
    craftTime: 1,
    impact: 10,
  },
  {
    name: ConsumableStats.CHARGE,
    recipe: {
      stone: 0,
      iron: 5,
      silver: 0,
      gold: 0,
      tin: 0,
      zinc: 0,
      crystal: 1,
      copper: 5,
    },
    quantity: 1,
    craftTime: 3,
    impact: 20,
  },
  {
    name: ConsumableStats.POWER,
    recipe: {
      stone: 0,
      iron: 3,
      silver: 3,
      gold: 0,
      tin: 0,
      zinc: 0,
      crystal: 1,
      copper: 0,
    },
    quantity: 1,
    craftTime: 2,
    impact: 10,
  },
  {
    name: ConsumableStats.POWER,
    recipe: {
      stone: 0,
      iron: 3,
      silver: 0,
      gold: 3,
      tin: 0,
      zinc: 0,
      crystal: 1,
      copper: 0,
    },
    quantity: 1,
    craftTime: 4,
    impact: 20,
  },
  {
    name: ConsumableStats.BONUS,
    recipe: {
      stone: 0,
      iron: 0,
      silver: 0,
      gold: 0,
      tin: 0,
      zinc: 2,
      crystal: 2,
      copper: 0,
    },
    quantity: 1,
    craftTime: 5,
    impact: 1,
  },
  {
    name: ConsumableStats.BONUS,
    recipe: {
      stone: 0,
      iron: 0,
      silver: 0,
      gold: 0,
      tin: 0,
      zinc: 5,
      crystal: 2,
      copper: 0,
    },
    quantity: 1,
    craftTime: 5,
    impact: 2,
  },
];
