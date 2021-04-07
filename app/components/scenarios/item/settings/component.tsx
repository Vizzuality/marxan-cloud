import React from 'react';

import Button from 'components/button';

export interface ItemSettingsProps {
  onDelete?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDuplicate?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const Item: React.FC<ItemSettingsProps> = ({
  onDelete,
  onDuplicate,
}: ItemSettingsProps) => {
  return (
    <div className="w-full px-8 pt-6 pb-4 bg-gray-700 rounded-b-3xl">
      <dl className="flex flex-col gap-2">
        <div className="flex gap-2 text-sm">
          <dt>Protected areas:</dt>
          <dd className="px-1.5 text-blue-400 bg-blue-400 bg-opacity-30 rounded">3</dd>
        </div>
        <div className="flex gap-2 text-sm">
          <dt>Features:</dt>
          <dd className="px-1.5 text-blue-400 bg-blue-400 bg-opacity-30 rounded">10</dd>
        </div>
        <div className="flex gap-2 text-sm">
          <dt>Runs:</dt>
          <dd>100 Solutions | BLM: 0.1</dd>
        </div>
        <div className="flex gap-2 text-sm">
          <dt>Schedules:</dt>
          <dd className="px-1.5 text-blue-400 bg-blue-400 bg-opacity-30 rounded">2</dd>
        </div>
      </dl>

      <div className="flex justify-end w-full gap-1 mt-2.5">
        <Button
          className="flex-shrink-0"
          size="s"
          theme="secondary"
          onClick={onDuplicate}
        >
          Duplicate
        </Button>

        <Button
          className="flex-shrink-0"
          size="s"
          theme="secondary"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default Item;
