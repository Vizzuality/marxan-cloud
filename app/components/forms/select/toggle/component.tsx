import React, { useCallback, useMemo } from 'react';
import cx from 'classnames';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';
import Icon from 'components/icon';

import THEME from 'components/forms/select/constants/theme';

import { SelectToggleProps } from 'components/forms/select/types';

export const SelectToggle: React.FC<SelectToggleProps> = ({
  options,
  theme,
  size,
  prefix,
  disabled,
  multiple,
  opened,
  selectedItems,
  placeholder,
  getToggleButtonProps,
  getDropdownProps,
}: SelectToggleProps) => {
  const getEnabledOptions = useMemo(() => {
    return options.filter((o) => !o.disabled && o.enabled);
  }, [options]);

  const labelDefaultFormatter:() => string = useCallback(() => {
    if (!selectedItems.length) return placeholder;
    if (selectedItems.length === 1) return selectedItems[0].label;
    if (selectedItems.length === getEnabledOptions.length) return 'All items selected';
    return `${selectedItems.length} items selected`;
  }, [selectedItems, placeholder, getEnabledOptions]);

  return (
    <button
      type="button"
      disabled={disabled}
      className={cx({
        'relative w-full flex items-center focus:outline-none tracking-wide': true,
        [THEME.sizes[size]]: true,
      })}
      {...!multiple && getToggleButtonProps()}
      {...multiple && getToggleButtonProps(getDropdownProps({ preventKeyAction: opened }))}
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

      <span className={cx({
        'text-sm leading-none': true,
        [THEME[theme].prefix.base]: selectedItems.length,
      })}
      >
        {labelDefaultFormatter()}
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

export default SelectToggle;
