import React, { useCallback, useMemo } from 'react';

import SingleDropdown from 'components/dropdowns/single';
import MultipleDropdown from 'components/dropdowns/multi';

import { DropdownProps } from './types';

export const Dropdown: React.FC<DropdownProps> = (props: DropdownProps) => {
  const { multiple, initialSelected, onChange } = props;

  const initialValues = useMemo(() => {
    if (multiple) {
      if (Array.isArray(initialSelected)) return initialSelected;

      return [initialSelected];
    }

    return initialSelected;
  }, [multiple, initialSelected]);

  const handleChange = useCallback((selected) => {
    if (Array.isArray(selected)) {
      const values = selected.map(({ value }) => value);
      onChange(values);
    } else {
      const { value } = selected;
      onChange(value);
    }
  }, [onChange]);

  if (multiple) {
    return <MultipleDropdown {...props} onSelect={handleChange} initialValues={initialValues} />;
  }

  return <SingleDropdown {...props} onSelect={handleChange} initialValues={initialValues} />;
};

export default Dropdown;
