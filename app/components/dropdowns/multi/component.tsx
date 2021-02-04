import React, { useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';

// Downshift;
import { useSelect, useMultipleSelection } from 'downshift';
import Toggle from 'components/dropdowns/toggle';
import Menu from 'components/dropdowns/menu';
import Checkbox from 'components/forms/checkbox';

// Popper
import { usePopper } from 'react-popper';
import {
  flipModifier, hideModifier, sameWidthModifier, offsetModifier,
} from 'components/dropdowns/constants/popper-modifiers';
import THEME from 'components/dropdowns/constants/theme';

import { DropdownProps, DropdownOptionProps } from 'components/dropdowns/types';

export const MultiDropdown: React.FC<DropdownProps> = ({
  theme = 'dark',
  size = 'base',
  status,
  prefix,
  options = [],
  initialValues = [],
  disabled = false,
  multiple = true,
  placeholder,
  clearSelectionActive = true,
  clearSelectionLabel = 'Clear selection',
  batchSelectionActive,
  batchSelectionLabel = 'Select all',
  onSelect,
  onBlur,
}: DropdownProps) => {
  const triggerRef = useRef();
  const menuRef = useRef();

  const getOptions = useMemo(() => {
    return [
      ...clearSelectionActive ? [{
        value: null,
        label: clearSelectionLabel,
        checkbox: false,
        enabled: false,
      }] : [],
      ...batchSelectionActive ? [{
        value: 'batch-selection',
        label: batchSelectionLabel,
        checkbox: false,
        enabled: false,
      }] : [],
      ...options.map((o) => ({ ...o, checkbox: true, enabled: true })),
    ];
  }, [
    options,
    clearSelectionActive,
    clearSelectionLabel,
    batchSelectionActive,
    batchSelectionLabel,
  ]);

  const getOptionsEnabled = useMemo(() => {
    return getOptions.filter((op) => !op.disabled && op.enabled);
  }, [getOptions]);

  const getInitialSelected = useMemo(() => {
    return getOptions.filter((o) => initialValues.includes(`${o.value}`));
  }, [getOptions, initialValues]);

  const isSelected = (selected: DropdownOptionProps, selectedItms: DropdownOptionProps[]) => (
    selectedItms.some((i) => i.value === selected.value)
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
        setSelectedItems(getOptionsEnabled);
        break;
      default:
        if (option.disabled) {
          break;
        }

        if (isSelected(option, selectedItems)) {
          removeSelectedItem(option);
          break;
        } else {
          addSelectedItem(option);
          break;
        }
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
    initialSelectedItems: getInitialSelected,
    stateReducer: (st, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      if (
        type === useMultipleSelection.stateChangeTypes.FunctionAddSelectedItem
        || type === useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem
        || type === useMultipleSelection.stateChangeTypes.FunctionSetSelectedItems
        || type === useMultipleSelection.stateChangeTypes.FunctionReset
      ) {
        onSelect(changes.selectedItems);
      }

      return changes;
    },
  });

  const {
    isOpen,
    highlightedIndex,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    closeMenu,
  } = useSelect({
    items: getOptions,
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

  // 'usePopper'
  const { styles, attributes } = usePopper(triggerRef.current, menuRef.current, {
    placement: 'bottom',
    // strategy: 'fixed',
    modifiers: [
      offsetModifier,
      flipModifier,
      hideModifier,
      sameWidthModifier,
    ],
  });

  // Hide menu if reference is outside the boundaries
  const referenceHidden = attributes?.popper?.['data-popper-reference-hidden'] || attributes?.popper?.['data-popper-reference-scaped'];
  useEffect(() => {
    if (referenceHidden) {
      closeMenu();
    }
  }, [referenceHidden, closeMenu]);

  return (
    <div
      className={cx({
        'w-full leading-tight overflow-hidden': true,
        [THEME[theme].container]: true,
        [THEME[theme].closed]: true,
        [THEME.states[status]]: true,
      })}
    >
      <div
        className="relative w-full"
        ref={triggerRef}
      >
        <Toggle
          options={getOptionsEnabled}
          theme={theme}
          size={size}
          status={status}
          prefix={prefix}
          disabled={disabled}
          multiple
          opened={isOpen}
          selectedItems={selectedItems}
          placeholder={placeholder}
          getToggleButtonProps={getToggleButtonProps}
          getDropdownProps={getDropdownProps}
        />
      </div>

      {/* Menu */}
      {createPortal(
        <div
          className="z-50"
          ref={menuRef}
          style={styles.popper}
          {...attributes.popper}
        >
          <Menu
            theme={theme}
            size={size}
            status={status}
            disabled={disabled}
            multiple
            opened={isOpen}
            attributes={attributes}
            getMenuProps={getMenuProps}
            onBlur={onBlur}
          >
            {isOpen && (
              <Toggle
                options={getOptionsEnabled}
                theme={theme}
                size={size}
                status={status}
                prefix={prefix}
                disabled={disabled}
                multiple={multiple}
                opened={isOpen}
                selectedItems={selectedItems}
                placeholder={placeholder}
                getToggleButtonProps={getToggleButtonProps}
                getDropdownProps={getDropdownProps}
              />
            )}

            {isOpen && (
              <ul
                className={cx({
                  'py-1 focus:outline-none': true,
                })}
              >
                {getOptions.map((option, index) => (
                  <li
                    className={cx({
                      'px-4 py-1 mt-0.5 cursor-pointer': true,
                      [THEME[theme].item.base]: highlightedIndex !== index,
                      [THEME[theme].item.disabled]: option.disabled,
                      [THEME[theme].item.highlighted]: (
                        (highlightedIndex === index && !option.disabled)
                        || isSelected(option, selectedItems)
                      ),
                    })}
                    key={`${option.value}`}
                    {...getItemProps({ item: option, index, disabled: option.disabled })}
                  >
                    <span
                      className={cx({
                        'ml-6': !!option.checkbox,
                      })}
                    >
                      {option.label}
                    </span>

                    {option.checkbox && (
                      <Checkbox
                        className="absolute bg-opacity-0 left-4"
                        checked={isSelected(option, selectedItems)}
                        disabled={option.disabled}
                        onChange={() => {}}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Menu>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default MultiDropdown;
