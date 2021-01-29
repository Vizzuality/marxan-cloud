import React, { useEffect, useRef } from 'react';
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

import { DropdownProps } from './types';

export const Dropdown: React.FC<DropdownProps> = ({
  theme = 'dark',
  size = 'base',
  status,
  onChange,
  prefix,
  options = [],
  disabled = false,
  clearable,
  placeholder,
  clearSelectionLabel = 'Clear selection',
}: DropdownProps) => {
  const triggerRef = useRef();
  const menuRef = useRef();
  const items = clearable
    ? [{ value: null, label: clearSelectionLabel }, ...options]
    : options;

  // Events
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
          theme={theme}
          size={size}
          status={status}
          prefix={prefix}
          disabled={disabled}
          opened={isOpen}
          selectedItem={selectedItem}
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
            options={items}
            theme={theme}
            size={size}
            status={status}
            prefix={prefix}
            disabled={disabled}
            opened={isOpen}
            selectedItem={selectedItem}
            placeholder={placeholder}
            highlightedIndex={highlightedIndex}
            attributes={attributes}
            getToggleButtonProps={getToggleButtonProps}
            getMenuProps={getMenuProps}
            getItemProps={getItemProps}
          />
        </div>,
        document.body,
      )}
    </div>
  );
};

export default Dropdown;
