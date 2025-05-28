import React from "react";
import { ExitForm, EXIT_FORMS } from "../../types/cells";

interface ExitFormSelectorProps {
  value: ExitForm;
  onChange: (form: ExitForm) => void;
}

export const ExitFormSelector: React.FC<ExitFormSelectorProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as ExitForm);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className="exit-form-selector"
    >
      <optgroup label="4 Exits">
        <option value={EXIT_FORMS.FOUR_EXITS.value}>
          {EXIT_FORMS.FOUR_EXITS.label}
        </option>
      </optgroup>

      <optgroup label="3 Exits">
        {EXIT_FORMS.THREE_EXITS.map((form) => (
          <option key={form.value} value={form.value}>
            {form.label}
          </option>
        ))}
      </optgroup>

      <optgroup label="2 Exits">
        {EXIT_FORMS.TWO_EXITS.map((form) => (
          <option key={form.value} value={form.value}>
            {form.label}
          </option>
        ))}
      </optgroup>

      <optgroup label="1 Exit">
        {EXIT_FORMS.ONE_EXIT.map((form) => (
          <option key={form.value} value={form.value}>
            {form.label}
          </option>
        ))}
      </optgroup>
    </select>
  );
};
