import React, { useState } from "react";
import { Cell } from "../../types/cells";
import { ResourceType, RESOURCE_TYPES } from "../../config/resourceConfig";

interface ResourceSelectorProps {
  resources: Cell["resources"];
  onChange: (resource: ResourceType) => void;
}

export const ResourceSelector: React.FC<ResourceSelectorProps> = ({
  resources,
  onChange,
}) => {
  const [selectedResource, setSelectedResource] = useState<ResourceType>(
    (Object.keys(resources || {})[0] as ResourceType) || "stone"
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newResource = e.target.value as ResourceType;
    setSelectedResource(newResource);
    onChange(newResource);
  };

  return (
    <div className="resource-selector">
      <h3>resources</h3>
      <select value={selectedResource} onChange={handleChange}>
        {RESOURCE_TYPES.map((resource) => (
          <option key={resource} value={resource}>
            {resource}
          </option>
        ))}
      </select>
    </div>
  );
};
