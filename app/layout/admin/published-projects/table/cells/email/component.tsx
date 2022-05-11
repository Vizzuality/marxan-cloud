import React from 'react';

export interface CellEmailProps {
  value: Record<string, string>[],
}

export const CellEmail: React.FC<CellEmailProps> = ({
  value,
}: CellEmailProps) => {
  if (!value) return null;

  return (
    <div className="space-y-1">
      {value.map((owner) => {
        const { id, email } = owner;
        return (
          <div key={id}>{email}</div>
        );
      })}
    </div>

  );
};

export default CellEmail;
