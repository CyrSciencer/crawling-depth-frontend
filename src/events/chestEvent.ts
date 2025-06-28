import { Player } from "../types/player";
import { Cell } from "../types/cells";
import { ConsumableStats } from "../config/consumablesConfig";

console.log("📦 Chest event module loaded");

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
  { type: "resource", name: "copper", value: 4, chance: [60, 70] },
  { type: "consumable", name: "health", value: 10, chance: [70, 80] },
  { type: "consumable", name: "charge", value: 10, chance: [80, 90] },
  { type: "consumable", name: "power", value: 10, chance: [90, 100] },
];

console.log("🎁 REWARDS configuration created with", REWARDS.length, "rewards");
console.log("📊 Rewards:", REWARDS);

export const chestEvent = (cell: Cell, player: Player): void => {
  console.log("📦 Chest event triggered");
  console.log("📍 Cell position:", cell.row, cell.col);
  console.log("🎯 Cell type:", cell.type);

  if (cell.type !== "chest") {
    console.log("⚠️ Cell is not a chest, skipping event");
    return;
  }

  console.log("🎲 Generating random number for reward selection...");
  const randomNumber = Math.floor(Math.random() * 100);
  console.log("🎲 Random number generated:", randomNumber);

  console.log("🔍 Finding matching reward...");
  const reward = REWARDS.find(
    (r) => randomNumber >= r.chance[0] && randomNumber < r.chance[1]
  );

  if (!reward) {
    console.log("⚠️ No reward found for random number:", randomNumber);
    return;
  }

  console.log("🎁 Reward selected:", reward);

  if (reward.type === "resource" && player.inventory.resources) {
    console.log("💎 Adding resource reward to inventory");
    console.log("📊 Resource type:", reward.name);
    console.log("📊 Reward value:", reward.value);
    console.log("📊 Current inventory resources:", player.inventory.resources);

    const currentValue =
      player.inventory.resources[
        reward.name as keyof typeof player.inventory.resources
      ] || 0;
    console.log("📊 Current value for", reward.name, ":", currentValue);

    player.inventory.resources[
      reward.name as keyof typeof player.inventory.resources
    ] = currentValue + reward.value;

    console.log(
      "📊 New value for",
      reward.name,
      ":",
      player.inventory.resources[
        reward.name as keyof typeof player.inventory.resources
      ]
    );
    console.log("✅ Resource added to inventory");
  } else if (reward.type === "consumable" && player.inventory.consumables) {
    console.log("💊 Adding consumable reward to inventory");
    console.log("📊 Consumable type:", reward.name);
    console.log("📊 Reward value:", reward.value);
    console.log("📊 Current consumables:", player.inventory.consumables);

    player.inventory.consumables.push({
      impactStat: reward.name as ConsumableStats,
      impactValue: reward.value,
      quantity: reward.value,
    });

    console.log("📊 Updated consumables:", player.inventory.consumables);
    console.log("✅ Consumable added to inventory");
  }

  console.log("🔄 Converting chest to floor");
  cell.type = "floor";
  console.log("✅ Chest event completed");
};

console.log("✅ Chest event module fully loaded");
