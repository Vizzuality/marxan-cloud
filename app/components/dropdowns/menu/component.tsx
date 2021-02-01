import React from 'react';
import cx from 'classnames';

import THEME from 'components/dropdowns/constants/theme';
import { DropdownMenuProps } from 'components/dropdowns/types';

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  theme,
  opened,
  attributes,
  getMenuProps,
  children,
}: DropdownMenuProps) => {
  return (
    <div
      {...getMenuProps()}
      className={cx({
        'focus:outline-none overflow-hidden': true,
        'invisible pointer-events-none': attributes?.popper?.['data-popper-reference-hidden'],
        [THEME[theme].open]: opened,
      })}
    >
      {children}
    </div>
  );
};

export default DropdownMenu;
