import React, { useCallback, useState } from 'react';

import ConfirmationPrompt from 'components/confirmation-prompt';
import Checkbox from 'components/forms/checkbox';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';

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

  const onAdmin = useCallback(() => {
    console.info(confirmAdmin);

    setConfirmAdmin(null);
  }, [confirmAdmin]);

  const onUnAdmin = useCallback(() => {
    console.info(confirmUnAdmin);

    setConfirmUnAdmin(null);
  }, [confirmUnAdmin]);

  return (
    <>
      <div>
        <Checkbox
          theme="light"
          checked={value}
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
        icon={DELETE_WARNING_SVG}
        open={!!confirmAdmin}
        onAccept={onAdmin}
        onRefuse={() => setConfirmAdmin(null)}
        onDismiss={() => setConfirmAdmin(null)}
      />
      <ConfirmationPrompt
        title={`Are you sure you want revoke admin permissions from "${confirmUnAdmin?.displayName}"?`}
        description="The action can be reverted."
        icon={DELETE_WARNING_SVG}
        open={!!confirmUnAdmin}
        onAccept={onUnAdmin}
        onRefuse={() => setConfirmUnAdmin(null)}
        onDismiss={() => setConfirmUnAdmin(null)}
      />
    </>
  );
};

export default CellAdmin;
