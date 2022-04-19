import React from 'react';

export interface CellOwnerProps {
  value: Record<string, string>,
}

export const CellOwner: React.FC<CellOwnerProps> = ({
  value,
}: CellOwnerProps) => {
  if (!value) return null;
  const { name, email } = value;
  return (
    <div className="space-y-1">
      <div className="font-semibold">{name}</div>
      <div>
        <a
          className="underline text-primary-500"
          href={`mailto:${email}`}
          target="_blank"
          rel="noreferrer"
        >
          {email}
        </a>
      </div>
    </div>

  );
};

export default CellOwner;
