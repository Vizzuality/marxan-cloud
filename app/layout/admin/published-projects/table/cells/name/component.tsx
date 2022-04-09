import React from 'react';

import Link from 'next/link';

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
    <Link href={`/projects/${id}`}>
      <a href={`/projects/${id}`} className="font-bold leading-none underline">
        {value}
      </a>
    </Link>
  );
};

export default CellName;
