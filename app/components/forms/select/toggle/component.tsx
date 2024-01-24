import React, { useCallback, useMemo } from 'react';

import THEME from 'components/forms/select/constants/theme';
import { SelectToggleProps } from 'components/forms/select/types';
import Icon from 'components/icon';
import { cn } from 'utils/cn';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';

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
  update,
  getToggleButtonProps,
  getDropdownProps,
}: SelectToggleProps) => {
  const toggleButtonProps = {
    ...(!multiple && {
      ...getToggleButtonProps(),
    }),
    ...(multiple && {
      ...getToggleButtonProps(getDropdownProps({ preventKeyAction: opened })),
    }),
  };

  const getEnabledOptions = useMemo(() => {
    return options.filter((o) => !o.disabled && o.enabled);
  }, [options]);

  const labelDefaultFormatter = useCallback(() => {
    if (!selectedItems.length) return placeholder;
    if (selectedItems.length === 1) return selectedItems[0].label;
    if (selectedItems.length === getEnabledOptions.length) return 'All items selected';
    return `${selectedItems.length} items selected`;
  }, [selectedItems, placeholder, getEnabledOptions]);

  return (
    <button
      aria-label="select"
      type="button"
      disabled={disabled}
      className={cn({
        'relative flex w-full items-center tracking-wide focus:outline-none': true,
        [THEME.sizes[size]]: true,
      })}
      {...{
        ...toggleButtonProps,
        onClick: (e) => {
          toggleButtonProps.onClick(e);
          if (update) update();
        },
      }}
    >
      {prefix && (
        <span
          className={cn({
            'mr-2 font-heading text-xs': true,
            [THEME[theme].prefix.base]: true,
          })}
        >
          {prefix}
        </span>
      )}

      <span
        className={cn({
          'overflow-hidden overflow-ellipsis whitespace-nowrap text-sm leading-none': true,
          [THEME[theme].prefix.base]: selectedItems.length,
          [THEME.sizes.label[size]]: true,
        })}
      >
        {labelDefaultFormatter()}
      </span>

      <Icon
        className={cn({
          'absolute right-4 h-3 w-3': true,
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
