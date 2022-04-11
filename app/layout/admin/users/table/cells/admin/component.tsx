import React, { useCallback, useState } from 'react';

import { useDeleteAdminUser, useSaveAdminUser } from 'hooks/admin';
import { useToasts } from 'hooks/toast';

import ConfirmationPrompt from 'components/confirmation-prompt';
import Checkbox from 'components/forms/checkbox';

import ADMIN_WARNING_SVG from 'svgs/notifications/admin.svg?sprite';

export interface CellAdminProps {
  value: boolean,
  row: any,
}

export const CellAdmin: React.FC<CellAdminProps> = ({
  value,
  row,
}: CellAdminProps) => {
  const [confirmAdmin, setConfirmAdmin] = useState<Record<string, any>>();
  const [confirmUnAdmin, setConfirmUnAdmin] = useState<Record<string, any>>();

  const saveAdminMutation = useSaveAdminUser({});
  const deleteAdminMutation = useDeleteAdminUser({});

  const { addToast } = useToasts();

  const onAdmin = useCallback(() => {
    saveAdminMutation.mutate({
      uid: confirmAdmin.id,
    }, {
      onSuccess: () => {
        setConfirmAdmin(null);
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
  }, [confirmAdmin, saveAdminMutation, addToast]);

  const onUnAdmin = useCallback(() => {
    deleteAdminMutation.mutate({
      uid: confirmUnAdmin.id,
    }, {
      onSuccess: () => {
        setConfirmUnAdmin(null);
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
  }, [confirmUnAdmin, deleteAdminMutation, addToast]);

  return (
    <>
      <div>
        <Checkbox
          theme="light"
          checked={value}
          className="block"
          onChange={(e) => {
            if (e.target.checked) {
              setConfirmAdmin(row.original);
            } else {
              setConfirmUnAdmin(row.original);
            }
          }}
        />
      </div>

      <ConfirmationPrompt
        title={`Are you sure you want to give admin permissions to "${confirmAdmin?.displayName}"?`}
        description="The action can be reverted."
        icon={ADMIN_WARNING_SVG}
        open={!!confirmAdmin}
        onAccept={onAdmin}
        onRefuse={() => setConfirmAdmin(null)}
        onDismiss={() => setConfirmAdmin(null)}
      />
      <ConfirmationPrompt
        title={`Are you sure you want revoke admin permissions from "${confirmUnAdmin?.displayName}"?`}
        description="The action can be reverted."
        icon={ADMIN_WARNING_SVG}
        open={!!confirmUnAdmin}
        onAccept={onUnAdmin}
        onRefuse={() => setConfirmUnAdmin(null)}
        onDismiss={() => setConfirmUnAdmin(null)}
      />
    </>
  );
};

export default CellAdmin;
