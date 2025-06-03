import Player from "../types/player";

interface Reward {
  type: "resource" | "consumable";
  name: string;
  value: number;
  chance: [number, number]; // [min, max]
}

const REWARDS: Reward[] = [
  { type: "resource", name: "iron", value: 4, chance: [0, 10] },
  { type: "resource", name: "silver", value: 4, chance: [10, 20] },
  { type: "resource", name: "gold", value: 4, chance: [20, 30] },
  { type: "resource", name: "tin", value: 4, chance: [30, 40] },
  { type: "resource", name: "zinc", value: 4, chance: [40, 50] },
  { type: "resource", name: "crystal", value: 4, chance: [50, 60] },
  { type: "consumable", name: "health", value: 10, chance: [60, 70] },
  { type: "consumable", name: "charge", value: 10, chance: [70, 80] },
  { type: "consumable", name: "power", value: 10, chance: [80, 90] },
  { type: "consumable", name: "bonus", value: 10, chance: [90, 100] },
];

export const chestEvent = (player: Player): void => {
  const randomNumber = Math.floor(Math.random() * 100);

  const reward = REWARDS.find(
    (r) => randomNumber >= r.chance[0] && randomNumber < r.chance[1]
  );

  if (!reward) return;

  if (reward.type === "resource" && player.inventory.resources) {
    player.inventory.resources[
      reward.name as keyof typeof player.inventory.resources
    ] =
      (player.inventory.resources[
        reward.name as keyof typeof player.inventory.resources
      ] || 0) + reward.value;
  } else if (reward.type === "consumable" && player.inventory.consumables) {
    player.inventory.consumables.push({
      impactStat: reward.name,
      quantity: reward.value,
    });
  }
};
