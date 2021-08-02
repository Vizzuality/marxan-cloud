import React, { useCallback, useState } from 'react';

import { useDeleteMe } from 'hooks/me';
import { useToasts } from 'hooks/toast';

import { signOut } from 'next-auth/client';

import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Loading from 'components/loading';

import DELETE_USER_WARNING_SVG from 'svgs/notifications/delete-user-warning.svg?sprite';

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
    <div className="relative w-full max-w-2xl">
      <h2 className="mb-5 text-lg font-medium text-gray-600 font-heading">Delete account</h2>

      <div className="inline-flex flex-col px-10 py-8 space-y-5 bg-white rounded-3xl">
        <div>
          <p className="text-sm">If you delete your account, please keep the following in mind:</p>
          <p className="text-sm">Your profile will be permenantly deleted, including information about projects.</p>
        </div>
        <div className="w-40">
          <Button theme="danger-alt" size="s" type="submit" disabled={submitting} onClick={() => setOpen(true)}>
            Delete Account
          </Button>
        </div>
      </div>

      <Loading
        visible={submitting}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />

      <ConfirmationPrompt
        danger
        title="Are you sure you want to delete your account?"
        description="Learn more about deleting your account."
        icon={DELETE_USER_WARNING_SVG}
        open={!!open}
        onAccept={onDelete}
        onRefuse={() => setOpen(null)}
        onDismiss={() => setOpen(null)}
      />

    </div>
  );
};

export default DeleteAccount;
