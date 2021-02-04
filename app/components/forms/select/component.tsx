import React from 'react';

import Dropdown from 'components/dropdowns';
import { DropdownProps } from 'components/dropdowns/types';

export interface SelectProps extends DropdownProps {
}

export const Select: React.FC<SelectProps> = (props: SelectProps) => {
  return (
    <Dropdown
      {...props}
    />
  );
};

export default Select;
