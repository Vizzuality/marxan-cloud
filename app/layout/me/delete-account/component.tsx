import React, { useCallback, useState } from 'react';

import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Loading from 'components/loading';

import { useDeleteMe } from 'hooks/me';
import { useToasts } from 'hooks/toast';
import { signOut } from 'next-auth/client';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';

export interface DeleteAccountProps {

}

export const DeleteAccount: React.FC<DeleteAccountProps> = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mutation = useDeleteMe({});
  const { addToast } = useToasts();

  const onDelete = useCallback(() => {
    mutation.mutate(null, {
      onSuccess: () => {
        addToast('success-delete-me', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">User deleted</p>
          </>
        ), {
          level: 'success',
        });
        setSubmitting(false);
        signOut();
      },
      onError: () => {
        addToast('error-delete-me', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">User could not be deleted</p>
          </>
        ), {
          level: 'error',
        });
        setSubmitting(false);
      },
    });
  }, [mutation, addToast]);

  return (
    <div className="relative">
      <h2 className="mb-5 text-lg font-medium text-gray-600 font-heading">Delete account</h2>

      <div className="mb-5">
        <p className="text-sm">If you delete your account, please keep the following in mind:</p>
        <p className="text-sm">Your profile will be permenantly deleted, including information about projects.</p>
      </div>

      <Button theme="danger" size="s" type="submit" disabled={submitting} onClick={() => setOpen(true)}>
        Delete account
      </Button>

      <Loading
        visible={submitting}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />

      <ConfirmationPrompt
        title="Are you sure you want to delete your account?"
        description="The action cannot be reverted. All the projects, scenarios and features created will be removed too."
        icon={DELETE_WARNING_SVG}
        open={!!open}
        onAccept={onDelete}
        onRefuse={() => setOpen(null)}
        onDismiss={() => setOpen(null)}
      />

    </div>
  );
};

export default DeleteAccount;
