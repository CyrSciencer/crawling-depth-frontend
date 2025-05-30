import { Inventory } from "../../types/player";
export const InventoryWindow = ({ inventory }: { inventory: Inventory }) => {
  return (
    <div>
      <h1>Inventory</h1>
      <div>
        <h2>Resources</h2>
        <p>Stone: {inventory.resources?.stone}</p>
        <p>Iron: {inventory.resources?.iron || 0}</p>
        <p>Silver: {inventory.resources?.silver || 0}</p>
        <p>Gold: {inventory.resources?.gold || 0}</p>
        <p>Tin: {inventory.resources?.tin || 0}</p>
        <p>Zinc: {inventory.resources?.zinc || 0}</p>
        <p>Crystal: {inventory.resources?.crystal || 0}</p>
      </div>
      <div>
        <h2>Blocks</h2>
        <p>Stone: {inventory.blocks?.stoneBlock || 0}</p>
        <p>Iron: {inventory.blocks?.ironBlock || 0}</p>
        <p>Silver: {inventory.blocks?.silverBlock || 0}</p>
        <p>Gold: {inventory.blocks?.goldBlock || 0}</p>
        <p>Tin: {inventory.blocks?.tinBlock || 0}</p>
        <p>Zinc: {inventory.blocks?.zincBlock || 0}</p>
        <p>Crystal: {inventory.blocks?.crystalBlock || 0}</p>
      </div>
      <div>
        <h2>Consumables</h2>
        {inventory.consumables?.map((consumable) => (
          <p key={consumable.impactStat}>
            {consumable.impactStat}: {consumable.quantity}
          </p>
        ))}
      </div>
      <div>
        <h2>Equipped</h2>
        {inventory.equiped && "charge" in inventory.equiped && (
          <p>
            <p>Pickaxe:</p>
            <p>Charge: {inventory.equiped.charge}</p>
          </p>
        )}
        {inventory.equiped && "power" in inventory.equiped && (
          <p>Power: {inventory.equiped.power}</p>
        )}
        {inventory.equiped && "bonus" in inventory.equiped && (
          <p>Bonus: {inventory.equiped.bonus}</p>
        )}
        {inventory.equiped &&
          Object.keys(inventory.equiped).some((key) =>
            key.endsWith("Block")
          ) && (
            <p>
              {Object.entries(inventory.equiped)
                .filter(([key]) => key.endsWith("Block"))
                .map(([key, value]) => (
                  <p key={key}>
                    {key.replace("Block", "")} Block: {value} left
                  </p>
                ))}
            </p>
          )}
      </div>
    </div>
  );
};
