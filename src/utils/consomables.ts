import { ResourceType } from "./resourceConfig";
export enum Consumable {
  HEALTH = "health",
  CHARGE = "charge",
  POWER = "power",
  BONUS = "bonus",
}

export interface ConsumableRecipe {
  name: Consumable;
  recipe: {
    [key in ResourceType]: number;
  };
  quantity: number;
  craftTime: number;
  description: string;
}

export const consumableRecipes: ConsumableRecipe[] = [
  {
    name: Consumable.HEALTH,
    recipe: {
      stone: 0,
      iron: 0,
      silver: 0,
      gold: 0,
      tin: 2,
      zinc: 0,
      crystal: 0,
    },
    quantity: 1,
    craftTime: 1,
    description: "Restaure un peu de santé",
  },
  {
    name: Consumable.HEALTH,
    recipe: {
      stone: 0,
      iron: 2,
      silver: 0,
      gold: 0,
      tin: 5,
      zinc: 0,
      crystal: 0,
    },
    quantity: 3,
    craftTime: 2,
    description: "Restaure une quantité moyenne de santé",
  },
  {
    name: Consumable.CHARGE,
    recipe: {
      stone: 0,
      iron: 0,
      silver: 0,
      gold: 0,
      tin: 0,
      zinc: 3,
      crystal: 0,
    },
    quantity: 1,
    craftTime: 1,
    description: "Recharge un peu votre outil",
  },
  {
    name: Consumable.CHARGE,
    recipe: {
      stone: 0,
      iron: 0,
      silver: 2,
      gold: 0,
      tin: 0,
      zinc: 8,
      crystal: 0,
    },
    quantity: 5,
    craftTime: 3,
    description: "Recharge complètement votre outil",
  },
  {
    name: Consumable.POWER,
    recipe: {
      stone: 0,
      iron: 4,
      silver: 0,
      gold: 0,
      tin: 0,
      zinc: 0,
      crystal: 0,
    },
    quantity: 1,
    craftTime: 2,
    description: "Augmente temporairement votre puissance",
  },
  {
    name: Consumable.POWER,
    recipe: {
      stone: 0,
      iron: 0,
      silver: 0,
      gold: 3,
      tin: 0,
      zinc: 0,
      crystal: 1,
    },
    quantity: 1,
    craftTime: 4,
    description: "Augmente significativement votre puissance",
  },
  {
    name: Consumable.BONUS,
    recipe: {
      stone: 0,
      iron: 0,
      silver: 0,
      gold: 2,
      tin: 0,
      zinc: 0,
      crystal: 2,
    },
    quantity: 1,
    craftTime: 5,
    description: "Applique un bonus spécial temporaire",
  },
];
