import React from 'react';
import cx from 'classnames';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';
import Icon from 'components/icon';

import THEME from 'components/dropdowns/constants/theme';

import { DropdownToggleProps } from 'components/dropdowns/types';

export const DropdownToggle: React.FC<DropdownToggleProps> = ({
  theme,
  size,
  prefix,
  disabled,
  opened,
  selectedItem,
  placeholder,
  getToggleButtonProps,
}: DropdownToggleProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cx({
        'relative w-full flex items-center focus:outline-none tracking-wide': true,
        [THEME.sizes[size]]: true,
      })}
      {...getToggleButtonProps()}
    >
      {prefix && (
      <span
        className={cx({
          'mr-2 text-xs font-heading': true,
          [THEME[theme].prefix.base]: true,
        })}
      >
        {prefix}
      </span>
      )}

      <span className="text-sm leading-none">
        {selectedItem?.label || placeholder}
      </span>

      <Icon
        className={cx({
          'absolute w-3 h-3 right-4': true,
          [THEME[theme].icon.closed]: !opened,
          [THEME[theme].icon.open]: opened,
          [THEME[theme].icon.disabled]: disabled,
        })}
        icon={ARROW_DOWN_SVG}
      />
    </button>
  );
};

export default DropdownToggle;
