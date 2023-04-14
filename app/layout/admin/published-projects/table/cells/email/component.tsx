import React from 'react';

export interface CellEmailProps {
  value: Record<string, string>[];
}

export const CellEmail: React.FC<CellEmailProps> = ({ value }: CellEmailProps) => {
  if (!value) return null;

  return (
    <div className="space-y-1">
      {value.map((owner) => {
        const { id, email } = owner;
        return (
          <div key={id}>
            <a className="break-all hover:underline" href={`mailto:${email}`}>
              {email}
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default CellEmail;
