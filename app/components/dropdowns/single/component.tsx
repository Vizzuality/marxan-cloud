import React, { useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';

// Downshift;
import { useSelect } from 'downshift';
import Toggle from 'components/dropdowns/toggle';
import Menu from 'components/dropdowns/menu';

// Popper
import { usePopper } from 'react-popper';
import {
  flipModifier, hideModifier, sameWidthModifier, offsetModifier,
} from 'components/dropdowns/constants/popper-modifiers';
import THEME from 'components/dropdowns/constants/theme';

import { DropdownProps, DropdownOptionProps } from 'components/dropdowns/types';

export const SingleDropdown: React.FC<DropdownProps> = ({
  theme = 'dark',
  size = 'base',
  status,
  prefix,
  options = [],
  disabled = false,
  placeholder,
  initialValues,
  clearSelectionActive,
  clearSelectionLabel = 'Clear selection',
  onSelect,
  onFocus,
  onBlur,
}: DropdownProps) => {
  const triggerRef = useRef();
  const menuRef = useRef();

  const getOptions = useMemo(() => {
    return [
      ...clearSelectionActive ? [
        {
          value: null,
          label: clearSelectionLabel,
        },
      ] : [],
      ...options,
    ];
  }, [
    options,
    clearSelectionActive,
    clearSelectionLabel,
  ]);

  const getInitialSelected = useMemo(() => {
    return getOptions.find((o) => o.value === initialValues);
  }, [getOptions, initialValues]);

  // Events
  const handleSelectedItems = (selected, reset) => {
    switch (selected.value) {
      case null:
        reset();
        break;
      default:
        break;
    }
  };

  const isSelected = (selected: DropdownOptionProps, selectedItms: DropdownOptionProps[]) => (
    selectedItms.some((i) => i.value === selected.value)
  );

  // 'useSelect'
  const {
    isOpen,
    selectedItem,
    highlightedIndex,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    closeMenu,
    reset,
  } = useSelect({
    items: getOptions,
    initialSelectedItem: getInitialSelected,
    stateReducer: (st, actionAndChanges) => {
      const { changes, type } = actionAndChanges;

      if (
        type === useSelect.stateChangeTypes.MenuKeyDownEnter
        || type === useSelect.stateChangeTypes.MenuKeyDownSpaceButton
        || type === useSelect.stateChangeTypes.ItemClick
      ) {
        onSelect(changes.selectedItem);
      }

      return changes;
    },
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

  const selectedItems = selectedItem ? [selectedItem] : [];

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
          options={getOptions}
          theme={theme}
          size={size}
          status={status}
          prefix={prefix}
          disabled={disabled}
          opened={isOpen}
          selectedItems={selectedItems}
          placeholder={placeholder}
          getToggleButtonProps={getToggleButtonProps}
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
            opened={isOpen}
            attributes={attributes}
            getMenuProps={getMenuProps}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            {isOpen && (
              <Toggle
                options={options}
                theme={theme}
                size={size}
                status={status}
                prefix={prefix}
                disabled={disabled}
                opened={isOpen}
                selectedItems={selectedItems}
                placeholder={placeholder}
                getToggleButtonProps={getToggleButtonProps}
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

export default SingleDropdown;
