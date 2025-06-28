import React from "react";
import { Cell } from "../../types/cells";

interface CellTypeSelectorProps {
  value: Cell["type"];
  onChange: (type: Cell["type"]) => void;
}

export const CellTypeSelector: React.FC<CellTypeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="cell-type-selector">
      <h3>cell type</h3>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Cell["type"])}
      >
        <option value="floor">floor</option>
        <option value="wall">wall</option>
      </select>
    </div>
  );
};
