import React from 'react';

export interface FieldProps {
  id: string;
  label?: string;
  input?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  children?: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  id,
  label,
  children,
  input,
  meta,
}: FieldProps) => {
  const getState = (m) => {
    if (m.touched && m.valid) return 'valid';
    if (m.touched && m.error) return 'error';

    return 'none';
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    // checking isValidElement is the safe way and avoids a typescript error too
    if (React.isValidElement(child)) {
      const state = getState(meta);

      return React.cloneElement(child, {
        ...input,
        id,
        state,
      });
    }
    return child;
  });

  return (
    <div>
      {label && (
        <label className="block mb-3 text-xs text-white uppercase" htmlFor={id}>
          {label}
        </label>
      )}
      {childrenWithProps}
    </div>
  );
};

export default Field;
