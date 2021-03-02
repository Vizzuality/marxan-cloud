import React, { useCallback, useMemo } from 'react';

import SingleSelect from 'components/forms/select/single';
import MultipleSelect from 'components/forms/select/multi';

import { SelectProps } from './types';

export const Select: React.FC<SelectProps> = (props: SelectProps) => {
  const {
    theme = 'dark',
    size = 'base',
    placeholder = 'Select...',
    multiple,
    initialSelected,
    onChange,
  } = props;

  const initialValues = useMemo(() => {
    if (multiple) {
      if (Array.isArray(initialSelected)) return initialSelected;

      return [initialSelected];
    }

    return initialSelected;
  }, [multiple, initialSelected]);

  const handleChange = useCallback((selected) => {
    if (Array.isArray(selected)) {
      const values = selected.map(({ value }) => value);
      onChange(values);
    } else {
      const { value } = selected;
      onChange(value);
    }
  }, [onChange]);

  if (multiple) {
    return (
      <MultipleSelect
        {...props}
        theme={theme}
        size={size}
        placeholder={placeholder}
        initialValues={initialValues}
        onSelect={handleChange}
      />
    );
  }

  return (
    <SingleSelect
      {...props}
      theme={theme}
      size={size}
      placeholder={placeholder}
      initialValues={initialValues}
      onSelect={handleChange}
    />
  );
};

export default Select;
