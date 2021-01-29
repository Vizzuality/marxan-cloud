interface DropdownThemeProps {
  theme: 'dark' | 'light';
  size: 'base' | 's';
  status: 'none' | 'error' | 'valid';
}

interface DropdownStatusProps {
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
}

interface DropdownDataProps {
  options?: DropdownOptionProps[];
  placeholder?: string;
  prefix?: string;
}

export interface DropdownProps extends
  DropdownStatusProps,
  DropdownDataProps,
  DropdownThemeProps {
  clearSelectionLabel?: string;
  onChange?: (option: DropdownOptionProps) => void;
}

export interface DropdownOptionProps {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface DropdownMenuProps extends
  DropdownStatusProps,
  DropdownDataProps,
  DropdownThemeProps {
  opened: boolean;
  selectedItem: {
    label: string;
  };
  highlightedIndex: number;
  attributes: Record<string, unknown>,
  getToggleButtonProps: () => void;
  getMenuProps: () => void;
  getItemProps: (e) => void;
}

export interface DropdownToggleProps extends
  DropdownStatusProps,
  DropdownDataProps,
  DropdownThemeProps {
  opened: boolean;
  selectedItem: {
    label: string;
  };
  getToggleButtonProps: () => void;
}
