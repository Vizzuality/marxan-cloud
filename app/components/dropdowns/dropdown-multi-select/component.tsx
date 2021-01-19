import React, { useCallback } from 'react';
import { useSelect, useMultipleSelection } from 'downshift';
import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';
import Icon from 'components/icon';
import Checkbox from 'components/forms/checkbox';
import cx from 'classnames';
import THEME from '../default-theme';

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
  hideCheckbox?: boolean;
}

export interface MultiSelectProps {
  options: Option[];
  theme: 'dark' | 'light';
  state: 'none' | 'error' | 'valid';
  onChange: (option: Option, selectedItems: Option[]) => void;
  prefix?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  defaultSelection?: Option[];
  clearSelectionLabel?: string;
  batchSelectionLabel?: string;
  batchSelectionActive?: boolean;
  labelFormatter?: (selectedItems: Option[]) => string;
}

export const DropdownMultiSelect: React.FC<MultiSelectProps> = ({
  options,
  theme = 'dark',
  state = 'none',
  onChange,
  prefix,
  disabled,
  className,
  placeholder,
  defaultSelection = [],
  batchSelectionLabel,
  clearSelectionLabel,
  batchSelectionActive,
  labelFormatter,
}: MultiSelectProps) => {
  const enabledOptions: () => Array<Option> = useCallback(() => {
    return options.filter((op) => !op.disabled);
  }, [options]);

  const items = batchSelectionActive
    ? [{ value: 'batch-selection', label: batchSelectionLabel, hideCheckbox: true },
      { value: null, label: clearSelectionLabel, hideCheckbox: true },
      ...options]
    : options;

  const isSelected = (selected: Option, selectedItems: Option[]) => (
    selectedItems.some((i) => i.value === selected.value)
  );

  const handleSelectedItem = ({
    option,
    selectedItems,
    addSelectedItem,
    removeSelectedItem,
    setSelectedItems,
    reset,
  }) => {
    switch (option.value) {
      case null:
        reset();
        break;
      case 'batch-selection':
        setSelectedItems(enabledOptions());
        break;
      default:
        if (isSelected(option, selectedItems)) {
          removeSelectedItem(option);
        } else if (option.disabled) {
          break;
        } else {
          addSelectedItem(option);
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
  } = useMultipleSelection({
    initialSelectedItems: defaultSelection,
    stateReducer: (st, actionAndChanges) => {
      const { changes, selectedItem } = actionAndChanges;
      onChange(selectedItem, changes.selectedItems);
      return actionAndChanges.changes;
    },
  });

  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items,
    stateReducer: (st, actionAndChanges) => {
      const { type, changes } = actionAndChanges;
      const { selectedItem: option } = changes;
      switch (type) {
        case useSelect.stateChangeTypes.MenuKeyDownEnter:
        case useSelect.stateChangeTypes.ItemClick:
          handleSelectedItem({
            option,
            selectedItems,
            addSelectedItem,
            removeSelectedItem,
            setSelectedItems,
            reset,
          });
          return {
            ...changes,
            highlightedIndex: st.highlightedIndex,
            isOpen: true,
          };
        default:
          return changes;
      }
    },
  });

  const labelDefaultFormatter:() => string = useCallback(() => {
    if (!selectedItems.length) return placeholder;
    if (selectedItems.length === 1) return selectedItems[0].label;
    if (selectedItems.length === enabledOptions().length) return 'All items selected';
    return `${selectedItems.length} items selected`;
  }, [selectedItems, placeholder, enabledOptions]);

  const customLabelFormatter: () => string = useCallback(() => {
    return labelFormatter(selectedItems);
  }, [selectedItems, labelFormatter]);

  return (
    <div
      className={cx({
        'w-full leading-tight overflow-hidden absolute left-0': true,
        [THEME[theme].container]: true,
        [THEME[theme].closed]: !selectedItem?.value && !isOpen,
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
          {labelFormatter ? customLabelFormatter() : labelDefaultFormatter()}
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
                'px-4 py-1 mt-0.5 cursor-pointer': true,
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
