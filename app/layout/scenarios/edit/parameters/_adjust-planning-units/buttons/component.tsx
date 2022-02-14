import React, { useState } from 'react';

import Clicking from './clicking';
import Drawing from './drawing';
import Uploading from './uploading';

export interface AnalysisAdjustButtonsProps {
  type: string;
}

export const AnalysisAdjustButtons: React.FC<AnalysisAdjustButtonsProps> = ({
  type,
}: AnalysisAdjustButtonsProps) => {
  const [selected, setSelected] = useState(null);

  const BUTTONS = [
    {
      id: 'clicking',
      Component: Clicking,
    },
    {
      id: 'drawing',
      Component: Drawing,
    },
    {
      id: 'uploading',
      Component: Uploading,
    },
  ];

  return (
    <div className="flex flex-col w-full space-y-2">
      {BUTTONS.map((b) => {
        const { id, Component } = b;
        const active = selected === b.id;

        return (
          <Component
            key={`${id}`}
            type={type}
            selected={active}
            onSelected={(s) => setSelected(s)}
          />
        );
      })}
    </div>
  );
};

export default AnalysisAdjustButtons;
