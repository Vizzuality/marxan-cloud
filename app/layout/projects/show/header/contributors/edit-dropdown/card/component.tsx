import React, {
  useCallback, useMemo, useState,
} from 'react';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { ROLES, ROLE_OPTIONS } from 'utils/constants-roles';

import { useOwnsProject } from 'hooks/permissions';
import { useSaveProjectUserRole, useDeleteProjectUser } from 'hooks/project-users';
import { useToasts } from 'hooks/toast';

import Avatar from 'components/avatar';
import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Select from 'components/forms/select';

import DELETE_USER_WARNING_SVG from 'svgs/notifications/delete-user-warning.svg?sprite';

export interface UserCardProps {
  id: string,
  name: string,
  image?: string,
  roleName: string,
}

export const UserCard: React.FC<UserCardProps> = ({
  id, name, image, roleName,
}: UserCardProps) => {
  const { query } = useRouter();
  const { pid } = query;

  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState(ROLES[roleName]);

  const { data: isOwner } = useOwnsProject(pid);

  const editProjectUserRoleMutation = useSaveProjectUserRole({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const deleteUserMutation = useDeleteProjectUser({});
  const { addToast } = useToasts();

  const OPTIONS = useMemo(() => {
    return ROLE_OPTIONS.filter((o) => o.value !== userRole);
  }, [userRole]);

  const onEditRole = useCallback((value) => {
    editProjectUserRoleMutation.mutate({ projectId: `${pid}`, data: { roleName: value, userId: id, projectId: `${pid}` } }, {

      onSuccess: ({ data: { data: s } }) => {
        addToast('success-user-role-edition', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">User role changed</p>
          </>
        ), {
          level: 'success',
        });

        console.info('User role changed succesfully', s);
      },
      onError: () => {
        addToast('error-user-role-edition', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">It is not allowed to change the role of this user</p>
          </>
        ), {
          level: 'error',
        });

        console.error('User role changed not saved');
      },
    });
  }, [pid, id, addToast, editProjectUserRoleMutation]);

  const onDelete = useCallback(() => {
    deleteUserMutation.mutate({ projectId: pid, userId: id }, {
      onSuccess: () => {
        addToast(`success- user - delete -${name}`, (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">
              {`User "${name}" deleted`}
            </p>
          </>
        ), {
          level: 'success',
        });
        setOpen(false);
      },
      onError: () => {
        addToast(`error - user - delete -${name}`, (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              {`"${name}" deletion is not allowed`}
            </p>
          </>
        ), {
          level: 'error',
        });
        setOpen(false);
      },
    });
  }, [deleteUserMutation, id, name, pid, addToast]);

  return (
    <div className="box-border flex items-center justify-between flex-grow w-full py-3 pl-3 pr-6 space-x-3 bg-gray-100 rounded-3xl">
      <Avatar
        className="box-border px-3 text-sm text-white uppercase border-none bg-primary-700"
        bgImage={image}
        name={name}
        size="lg"
      >
        {!image && name.slice(0, 2)}
      </Avatar>
      <div className="flex flex-col self-center flex-grow w-full space-y-1">
        <p className="w-40 text-sm text-black clamp-1">{name}</p>
        <div className="w-40 pr-4">
          {isOwner && (
            <Select
              initialSelected={ROLES[roleName]}
              maxHeight={300}
              size="s"
              status="none"
              theme="light"
              placeholder={ROLES[roleName]}
              options={OPTIONS}
              onChange={(value: string) => {
                onEditRole(value);
                setUserRole(value);
              }}
            />
          )}
          {!isOwner && (<p className="text-sm text-black">{ROLES[roleName]}</p>)}
        </div>
      </div>

      <Button
        className={cx({
          'flex-shrink-0 h-6 py-2 text-sm bg-gray-600 group': true,
          invisible: !isOwner,
        })}
        theme="secondary-alt"
        size="xs"
        disabled={!isOwner}
        onClick={() => setOpen(true)}
      >
        <span className="text-white group-hover:text-gray-600">Remove</span>
      </Button>

      <ConfirmationPrompt
        title={`Are you sure you want to remove ${name} from this project?`}
        icon={DELETE_USER_WARNING_SVG}
        open={!!open}
        onAccept={onDelete}
        onRefuse={() => setOpen(null)}
        onDismiss={() => setOpen(null)}
      />
    </div>
  );
};

export default UserCard;
