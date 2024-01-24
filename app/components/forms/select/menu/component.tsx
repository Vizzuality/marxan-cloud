import React from 'react';

import THEME from 'components/forms/select/constants/theme';
import { SelectMenuProps } from 'components/forms/select/types';
import { cn } from 'utils/cn';

export const SelectMenu: React.FC<SelectMenuProps> = ({
  theme,
  opened,
  attributes,
  children,
}: SelectMenuProps) => {
  return (
    <div
      className={cn({
        'overflow-hidden focus:outline-none': true,
        'pointer-events-none invisible': attributes?.popper?.['data-popper-reference-hidden'],
        [THEME[theme].open]: opened,
      })}
    >
      {children}
    </div>
  );
};

export default SelectMenu;
