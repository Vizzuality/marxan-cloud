import React, { useCallback, useState } from 'react';

import ConfirmationPrompt from 'components/confirmation-prompt';
import Checkbox from 'components/forms/checkbox';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';

export interface CellBlockProps {
  value: boolean,
  row: any,
}

export const CellBlock: React.FC<CellBlockProps> = ({
  value,
  row,
}: CellBlockProps) => {
  const [confirmBlock, setConfirmBlock] = useState<Record<string, any>>();
  const [confirmUnBlock, setConfirmUnBlock] = useState<Record<string, any>>();

  const onBlock = useCallback(() => {
    console.info(confirmBlock);

    setConfirmBlock(null);
  }, [confirmBlock]);

  const onUnBlock = useCallback(() => {
    console.info(confirmUnBlock);

    setConfirmUnBlock(null);
  }, [confirmUnBlock]);

  return (
    <>
      <div>
        <Checkbox
          theme="light"
          checked={value}
          onChange={(e) => {
            if (e.target.checked) {
              setConfirmBlock(row.original);
            } else {
              setConfirmUnBlock(row.original);
            }
          }}
        />
      </div>

      <ConfirmationPrompt
        title={`Are you sure you want to block "${confirmBlock?.displayName}"?`}
        description="The action can be reverted."
        icon={DELETE_WARNING_SVG}
        open={!!confirmBlock}
        onAccept={onBlock}
        onRefuse={() => setConfirmBlock(null)}
        onDismiss={() => setConfirmBlock(null)}
      />
      <ConfirmationPrompt
        title={`Are you sure you want to unblock "${confirmUnBlock?.displayName}"?`}
        description="The action can be reverted."
        icon={DELETE_WARNING_SVG}
        open={!!confirmUnBlock}
        onAccept={onUnBlock}
        onRefuse={() => setConfirmUnBlock(null)}
        onDismiss={() => setConfirmUnBlock(null)}
      />
    </>
  );
};

export default CellBlock;
