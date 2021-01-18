import React from 'react';
import { useSelect, useMultipleSelection } from 'downshift';
import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg';
import Icon from 'components/icon';
import Checkbox from 'components/forms/checkbox';
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
      disabled: 'opacity-50 pointer-events-none',
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
      disabled: 'opacity-50 pointer-events-none',
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
  hideCheckbox?: boolean;
  disabled?: boolean;
}

export interface MultiSelectProps {
  theme: 'dark' | 'light';
  state: 'none' | 'error' | 'valid';
  options: Array<Option>;
  onChange: (option: Option, selectedItems: Array<Option>) => void;
  prefix?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  defaultSelection?: Array<Option>;
  clearSelectionLabel?: string;
  batchSelectionLabel?: string;
  batchSelectionActive?: boolean;
}

export const DropdownMultiSelect: React.FC<MultiSelectProps> = ({
  theme = 'dark',
  state = 'none',
  options,
  onChange,
  prefix,
  disabled,
  className,
  placeholder,
  defaultSelection = [],
  batchSelectionLabel = 'Add all scenarios',
  clearSelectionLabel = 'Remove all scenarios',
  batchSelectionActive,
}: MultiSelectProps) => {
  const itemToString = (option) => (option ? option.label : '');
  const enabledOptions = () => options.filter((op) => !op.disabled);
  const items = batchSelectionActive
    ? [{ value: 'batch-selection', label: batchSelectionLabel, hideCheckbox: true },
      { value: 'clear-selection', label: clearSelectionLabel, hideCheckbox: true },
      ...options]
    : options;

  const isSelected = (selected: Option, selectedItems: Array<Option>) => (
    selectedItems.some((i) => i.value === selected.value)
  );

  const selectLabel = (selectedItems) => {
    if (!selectedItems.length) return placeholder;
    if (selectedItems.length === 1) return itemToString(selectedItems[0]);
    return `${selectedItems.length} items selected`;
  };

  const handleSelectedItem = ({
    selected,
    selectedItems,
    addSelectedItem,
    removeSelectedItem,
    setSelectedItems,
    reset,
  }) => {
    switch (selected.value) {
      case 'clear-selection':
        reset();
        break;
      case 'batch-selection':
        setSelectedItems(enabledOptions());
        break;
      default:
        if (isSelected(selected, selectedItems)) {
          removeSelectedItem(selected);
        } else if (selected.disabled) {
          break;
        } else {
          addSelectedItem(selected);
        }
        break;
    }
  };

  const {
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    setSelectedItems,
    selectedItems,
    reset,
  } = useMultipleSelection({ initialSelectedItems: defaultSelection });

  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items,
    onStateChange: ({ type, selectedItem: selected }) => {
      switch (type) {
        case useSelect.stateChangeTypes.MenuKeyDownEnter:
        case useSelect.stateChangeTypes.ItemClick:
          if (selected) {
            handleSelectedItem({
              selected,
              selectedItems,
              addSelectedItem,
              removeSelectedItem,
              setSelectedItems,
              reset,
            });
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
        {...getToggleButtonProps(getDropdownProps({ preventKeyAction: isOpen }))}
      >
        {prefix && <span className="mr-2 text-base">{prefix}</span>}
        <span className="text-base">
          {selectLabel(selectedItems)}
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
        {isOpen && (
          items.map((option, index) => (
            <li
              className={cx({
                'px-4 mt-2 cursor-pointer': true,
                [THEME[theme].item.base]: highlightedIndex !== index,
                [THEME[theme].item.highlighted]: highlightedIndex === index,
                [THEME[theme].item.disabled]: option.disabled,
              })}
              key={`${option.value}`}
              {...getItemProps({ item: option, index })}
            >
              {!option.hideCheckbox && (
              <Checkbox
                className="absolute bg-opacity-0 left-4"
                checked={isSelected(option, selectedItems)}
                onChange={() => onChange(option, selectedItems)}
                disabled={option.disabled}
              />
              )}
              <span
                className="ml-6"
              >
                {option.label}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default DropdownMultiSelect;
