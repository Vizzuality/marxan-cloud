import React from 'react';

export interface CellOwnerProps {
  value: Record<string, string>[],
}

export const CellOwner: React.FC<CellOwnerProps> = ({
  value,
}: CellOwnerProps) => {
  if (!value) return null;

  return (
    <div className="space-y-1">
      {value.map((owner) => {
        const { id, displayName } = owner;
        return (
          <div key={id} className="font-semibold">{displayName}</div>
        );
      })}
    </div>

  );
};

export default CellOwner;
