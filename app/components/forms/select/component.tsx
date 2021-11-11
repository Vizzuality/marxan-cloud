import React, { useCallback, useMemo } from 'react';

import MultipleSelect from 'components/forms/select/multi';
import SingleSelect from 'components/forms/select/single';

import { SelectProps } from './types';

export const Select: React.FC<SelectProps> = (props: SelectProps) => {
  const {
    theme = 'dark',
    size = 'base',
    placeholder = 'Select...',
    multiple,
    selected,
    initialSelected,
    onChange,
  } = props;

  const isServer = typeof window === 'undefined';

  const initialValues = useMemo(() => {
    if (multiple) {
      if (Array.isArray(initialSelected)) return initialSelected;

      return [initialSelected];
    }

    return initialSelected;
  }, [multiple, initialSelected]);

  const values = useMemo(() => {
    if (typeof selected !== 'undefined') {
      if (multiple) {
        if (Array.isArray(selected)) return selected;

        return [selected];
      }
    }
    return selected;
  }, [multiple, selected]);

  const handleChange = useCallback((s) => {
    if (Array.isArray(s)) {
      const vs = s.map(({ value }) => value);
      onChange(vs);
    } else {
      const { value } = s;
      onChange(value);
    }
  }, [onChange]);

  if (multiple && !isServer) {
    return (
      <MultipleSelect
        {...props}
        theme={theme}
        size={size}
        placeholder={placeholder}
        initialValues={initialValues}
        values={values}
        onSelect={handleChange}
      />
    );
  }

  if (!multiple && !isServer) {
    return (
      <SingleSelect
        {...props}
        theme={theme}
        size={size}
        placeholder={placeholder}
        initialValues={initialValues}
        values={values}
        onSelect={handleChange}
      />
    );
  }
  return null;
};

export default Select;
