import React from 'react';
import cx from 'classnames';

import THEME from 'components/forms/select/constants/theme';
import { SelectMenuProps } from 'components/forms/select/types';

export const SelectMenu: React.FC<SelectMenuProps> = ({
  theme,
  opened,
  attributes,
  children,
}: SelectMenuProps) => {
  return (
    <div
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

export default SelectMenu;
