import React, { useCallback } from 'react';

import SingleDropdown from 'components/dropdowns/single';
import MultipleDropdown from 'components/dropdowns/multi';

import { DropdownProps } from './types';

export const Dropdown: React.FC<DropdownProps> = (props: DropdownProps) => {
  const { multiple, onChange } = props;

  const handleChange = useCallback((selected) => {
    onChange(selected);
  }, [onChange]);

  if (multiple) {
    return <MultipleDropdown {...props} onSelect={handleChange} />;
  }

  return <SingleDropdown {...props} onSelect={handleChange} />;
};

export default Dropdown;
