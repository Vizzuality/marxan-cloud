import React from 'react';
import cx from 'classnames';

import Toggle from 'components/dropdowns/toggle';

import THEME from 'components/dropdowns/constants/theme';
import { DropdownMenuProps } from 'components/dropdowns/types';

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  theme,
  size,
  status,
  prefix,
  disabled,
  opened,
  selectedItem,
  placeholder,
  options,
  attributes,
  highlightedIndex,
  getToggleButtonProps,
  getMenuProps,
  getItemProps,
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
      {opened && (
        <Toggle
          theme={theme}
          size={size}
          status={status}
          prefix={prefix}
          disabled={disabled}
          opened={opened}
          selectedItem={selectedItem}
          placeholder={placeholder}
          getToggleButtonProps={getToggleButtonProps}
        />
      )}

      {opened && (
        <ul
          className={cx({
            'py-1 focus:outline-none': true,
          })}
        >
          {options.map((option, index) => (
            <li
              className={cx({
                'px-4 py-1 mt-0.5 cursor-pointer': true,
                [THEME[theme].item.base]: highlightedIndex !== index,
                [THEME[theme].item.highlighted]: highlightedIndex === index,
              })}
              key={`${option.value}`}
              {...getItemProps({ item: option, index })}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;
