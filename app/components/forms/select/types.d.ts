import { ReactNode, FocusEventHandler } from 'react';

interface SelectThemeProps {
  theme: 'dark' | 'light' | 'light-square' | 'modal';
  size: 'base' | 's' | 'xs';
  status?: 'none' | 'error' | 'valid';
  maxHeight?: number | string;
}

interface SelectStatusProps {
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
}

interface SelectDataProps {
  options?: Readonly<SelectOptionProps[]>;
  placeholder?: string;
  prefix?: string;
  initialSelected?: string | string[];
  selected?: string | string[];
  initialValues?: string | string[];
  values?: string | string[];
  clearSelectionActive?: boolean;
  clearSelectionLabel?: string;
  batchSelectionActive?: boolean;
  batchSelectionLabel?: string;
  removeSelected?: boolean;
}

export interface SelectProps extends SelectStatusProps, SelectDataProps, SelectThemeProps {
  onChange?: (selection: string | string[]) => void;
  onSelect?: (option: SelectOptionProps | SelectOptionProps[]) => void;
  onFocus?: FocusEventHandler;
  onBlur?: FocusEventHandler;
}

export interface SelectOptionProps {
  label: string | ReactNode;
  value: string | number;
  disabled?: boolean;
  enabled?: boolean;
  checkbox?: boolean;
}

export interface SelectMenuProps extends SelectStatusProps, SelectThemeProps {
  children: ReactNode;
  opened: boolean;
  attributes: Record<string, unknown>;
}

export interface SelectToggleProps extends SelectStatusProps, SelectDataProps, SelectThemeProps {
  opened: boolean;
  selectedItems: SelectOptionProps[];
  getToggleButtonProps: (e?: any) => any;
  getDropdownProps?: (e?: any) => any;
  update?: () => void;
}
