import React from 'react';
import { useSelect } from 'downshift';
import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';
import Icon from 'components/icon';
import cx from 'classnames';
import THEME from '../default-theme';

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SingleSelectProps {
  theme: 'dark' | 'light';
  size: 'base' | 's';
  state: 'none' | 'error' | 'valid';
  onChange: (option: Option) => void;
  prefix?: string;
  options?: Option[];
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  placeholder?: string;
  clearSelectionLabel?: string;
}

export const DropdownSelect: React.FC<SingleSelectProps> = ({
  theme = 'dark',
  size = 'base',
  state,
  onChange,
  prefix,
  options = [],
  disabled = false,
  clearable,
  className,
  placeholder,
  clearSelectionLabel = 'Clear selection',
}: SingleSelectProps) => {
  const items = clearable
    ? [{ value: null, label: clearSelectionLabel }, ...options]
    : options;

  const handleSelectedItems = (selected, clearSelection) => {
    switch (selected.value) {
      case null:
        clearSelection();
        break;
      default:
        onChange(selected);
        break;
    }
  };

  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    reset,
  } = useSelect({
    items,
    onStateChange: ({ type, selectedItem: selected }) => {
      switch (type) {
        case useSelect.stateChangeTypes.MenuKeyDownEnter:
        case useSelect.stateChangeTypes.ItemClick:
          if (selected) {
            handleSelectedItems(selected, reset);
          }
          break;
        default:
          break;
      }
    },
  });

  return (
    <div
      className={cx({
        'w-full leading-tight overflow-hidden': true,
        [THEME[theme].container]: !isOpen,
        [THEME[theme].closed]: !selectedItem && !isOpen,
        [THEME[theme].open]: isOpen,
        [THEME.states[state]]: true,
        [className]: !!className,
      })}
    >
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
            [THEME[theme].icon.closed]: !isOpen,
            [THEME[theme].icon.open]: isOpen,
            [THEME[theme].icon.disabled]: disabled,
          })}
          icon={ARROW_DOWN_SVG}
        />
      </button>

      {/* Menu */}
      {isOpen && (
        <ul
          className={cx({
            'pt-1 pb-3 focus:outline-none': true,
          })}
          {...getMenuProps()}
        >
          {items.map((option, index) => (
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

export default DropdownSelect;
