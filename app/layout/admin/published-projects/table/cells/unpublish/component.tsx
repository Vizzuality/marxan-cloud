import React, { useCallback, useState } from 'react';

import { useUnPublishProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';

export interface CellUnpublishProps {
  row: any,
}

export const CellUnpublish: React.FC<CellUnpublishProps> = ({
  row,
}: CellUnpublishProps) => {
  const [confirmUnPublish, setConfirmUnPublish] = useState<Record<string, any>>();

  const { addToast } = useToasts();

  const unpublishProjectMutation = useUnPublishProject({});

  const handleUnpublish = useCallback(() => {
    unpublishProjectMutation.mutate({
      id: confirmUnPublish.id,
    }, {
      onSuccess: () => {
        setConfirmUnPublish(null);
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
  }, [unpublishProjectMutation, confirmUnPublish, addToast]);

  return (
    <>
      <Button
        theme="danger"
        size="xs"
        onClick={() => {
          setConfirmUnPublish(row.original);
        }}
      >
        Unpublish
      </Button>

      <ConfirmationPrompt
        title={`Are you sure you want unpublish "${row.original?.name}"?`}
        // description="The action can be reverted."
        icon={DELETE_WARNING_SVG}
        iconClassName="w-16 h-16"
        open={!!confirmUnPublish}
        onAccept={handleUnpublish}
        onRefuse={() => setConfirmUnPublish(null)}
        onDismiss={() => setConfirmUnPublish(null)}
      />

    </>
  );
};

export default CellUnpublish;
