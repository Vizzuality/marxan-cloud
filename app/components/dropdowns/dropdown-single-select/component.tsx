import React from 'react';
import { useSelect } from 'downshift';
import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg';
import Icon from 'components/icon';
import cx from 'classnames';

const THEME = {
  dark: {
    container: 'text-white bg-gray-800 border-2 rounded-3xl py-1.5',
    open: 'border-2 border-primary-400 text-base',
    closed: 'border-gray-400 text-gray-400',
    icon: {
      closed: 'text-white',
      open: 'fill-primary transform rotate-180',
      disabled: 'text-gray-400',
    },
    item: {
      base: 'text-gray-300',
      highlighted: 'bg-gray-700 text-white',
    },
  },
  light: {
    container: 'text-gray-600 bg-white border-2 rounded-3xl py-1.5',
    open: 'border-2 border-primary-400 text-base',
    closed: 'border-gray-400 text-gray-400',
    icon: {
      closed: 'text-gray-600',
      open: 'fill-primary transform rotate-180',
      disabled: 'text-gray-400',
    },
    item: {
      base: 'text-gray-400',
      highlighted: 'bg-gray-100 text-gray-800',
    },
  },
  states: {
    none: '',
    error: 'border-red-500',
    valid: 'border-green-500',
  },
};

interface Option {
  label: string;
  value: string | number;
  checkbox?: boolean;
  disabled?: boolean;
}

export interface SingleSelectProps {
  theme?: 'dark' | 'light';
  disabled?: boolean;
  prefix?: string;
  placeholder?: string;
  options?: Array<Option>;
  onChange: (option: Option) => void;
  clearable?: boolean;
  clearSelectionLabel?: string;
  className?: string;
  state: 'none' | 'error' | 'valid';
}

export const DropdownSelect: React.FC<SingleSelectProps> = ({
  theme = 'dark',
  state = 'none',
  disabled = false,
  prefix,
  placeholder,
  options = [],
  onChange,
  clearable,
  clearSelectionLabel = 'Clear selection',
  className,
}: SingleSelectProps) => {
  const itemToString = (option) => (option ? option.label : '');
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
        'w-full leading-tight overflow-hidden absolute left-0': true,
        [THEME[theme].container]: true,
        [THEME[theme].closed]: !itemToString(selectedItem) && !isOpen,
        [THEME[theme].open]: isOpen,
        [THEME.states[state]]: true,
        [className]: !!className,
      })}
    >
      <button
        type="button"
        disabled={disabled}
        className={cx({
          'relative w-full flex items-center focus:outline-blue px-4': true,
        })}
        {...getToggleButtonProps()}
      >
        {prefix && <span className="mr-2 text-base">{prefix}</span>}
        <span className="text-base">
          {`${itemToString(selectedItem)}` || placeholder}
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
      <ul
        className={cx({
          'focus:outline-none': true,
        })}
        {...getMenuProps()}
      >
        {isOpen
          && items.map((option, index) => (
            <li
              className={cx({
                'px-4 mt-2 cursor-pointer': true,
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
    </div>
  );
};

export default DropdownSelect;
