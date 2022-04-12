import React from 'react';

export interface CellNameProps {
  value: string,
  row: any,
}

export const CellName: React.FC<CellNameProps> = ({
  value,
  row,
}: CellNameProps) => {
  if (!value) return null;

  const { id } = row.original;
  return (
    <a
      href={`/community/projects/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-bold leading-none underline"
    >
      {value}
    </a>
  );
};

export default CellName;
