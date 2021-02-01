import { ReactNode } from 'react';

interface DropdownThemeProps {
  theme: 'dark' | 'light';
  size: 'base' | 's';
  status: 'none' | 'error' | 'valid';
}

interface DropdownStatusProps {
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
}

interface DropdownDataProps {
  options?: DropdownOptionProps[];
  placeholder?: string;
  prefix?: string;
  initialSelected?: [];
  clearSelectionActive?: boolean;
  clearSelectionLabel?: string;
  batchSelectionActive?: boolean;
  batchSelectionLabel?: string;
}

export interface DropdownProps extends
  DropdownStatusProps,
  DropdownDataProps,
  DropdownThemeProps {
  onChange?: (selection: string | string[]) => void;
  onSelect?: (option: DropdownOptionProps | DropdownOptionProps[]) => void;
}

export interface DropdownOptionProps {
  label: string;
  value: string | number;
  disabled?: boolean;
  checkbox?: boolean;
}

export interface DropdownMenuProps extends
  DropdownStatusProps,
  DropdownThemeProps {
  children: ReactNode;
  opened: boolean;
  attributes: Record<string, unknown>,
  getMenuProps: () => void;
}

export interface DropdownToggleProps extends
  DropdownStatusProps,
  DropdownDataProps,
  DropdownThemeProps {
  opened: boolean;
  selectedItems: DropdownOptionProps[];
  getToggleButtonProps: () => void;
  getDropdownProps?: () => void;
}
