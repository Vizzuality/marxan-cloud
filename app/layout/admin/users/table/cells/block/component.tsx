import React, { useCallback, useState } from 'react';

import { useDeleteBlockUser, useSaveBlockUser } from 'hooks/admin';
import { useToasts } from 'hooks/toast';

import ConfirmationPrompt from 'components/confirmation-prompt';
import Checkbox from 'components/forms/checkbox';

import BLOCK_WARNING_SVG from 'svgs/notifications/block.svg?sprite';

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

  const saveBlockMutation = useSaveBlockUser({});
  const deleteBlockMutation = useDeleteBlockUser({});

  const { addToast } = useToasts();

  const onBlock = useCallback(() => {
    saveBlockMutation.mutate({
      uid: confirmBlock.id,
    }, {
      onSuccess: () => {
        setConfirmBlock(null);
      },
      onError: () => {
        addToast('save-admin-error', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              Oops! Something went wrong.
              <br />
              Please, try again!
            </p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [confirmBlock, saveBlockMutation, addToast]);

  const onUnBlock = useCallback(() => {
    deleteBlockMutation.mutate({
      uid: confirmUnBlock.id,
    }, {
      onSuccess: () => {
        setConfirmUnBlock(null);
      },
      onError: () => {
        addToast('delete-admin-error', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              Oops! Something went wrong.
              <br />
              Please, try again!
            </p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [confirmUnBlock, deleteBlockMutation, addToast]);

  return (
    <>
      <div>
        <Checkbox
          theme="light"
          checked={value}
          className="block"
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
        icon={BLOCK_WARNING_SVG}
        iconClassName="w-16 h-16"
        open={!!confirmBlock}
        onAccept={onBlock}
        onRefuse={() => setConfirmBlock(null)}
        onDismiss={() => setConfirmBlock(null)}
      />
      <ConfirmationPrompt
        title={`Are you sure you want to unblock "${confirmUnBlock?.displayName}"?`}
        icon={BLOCK_WARNING_SVG}
        iconClassName="w-16 h-16"
        open={!!confirmUnBlock}
        onAccept={onUnBlock}
        onRefuse={() => setConfirmUnBlock(null)}
        onDismiss={() => setConfirmUnBlock(null)}
      />
    </>
  );
};

export default CellBlock;
