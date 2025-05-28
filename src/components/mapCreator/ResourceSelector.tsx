import React from "react";
import { Cell } from "../../types/cells";
import { ResourceType, RESOURCE_TYPES } from "../../utils/resourceConfig";

interface ResourceSelectorProps {
  resources: Cell["resources"];
  onChange: (resource: ResourceType) => void;
}

export const ResourceSelector: React.FC<ResourceSelectorProps> = ({
  resources,
  onChange,
}) => {
  const currentResource =
    (Object.keys(resources || {})[0] as ResourceType) || "stone";

  return (
    <div className="resource-selector">
      <h3>resources</h3>
      <select
        value={currentResource}
        onChange={(e) => onChange(e.target.value as ResourceType)}
      >
        {RESOURCE_TYPES.map((resource) => (
          <option key={resource} value={resource}>
            {resource}
          </option>
        ))}
      </select>
    </div>
  );
};
