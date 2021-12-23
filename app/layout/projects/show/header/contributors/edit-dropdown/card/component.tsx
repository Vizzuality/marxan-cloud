import React, { useCallback, useMemo, useState } from 'react';

import { useRouter } from 'next/router';

import { useEditProjectUserRole, useDeleteProjectUser } from 'hooks/project-users';
import { useToasts } from 'hooks/toast';

import Avatar from 'components/avatar';
import Button from 'components/button';
import Select from 'components/forms/select';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import USER_REMOVE_SVG from 'svgs/users/user-remove.svg?sprite';

import { ROLES, ROLE_OPTIONS } from './constants';

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

  const editProjectUserRoleMutation = useEditProjectUserRole({
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
        <p className="text-sm text-black clamp-1">{name}</p>
        <div className="pr-20">
          <Select
            initialSelected={ROLES[roleName]}
            maxHeight={300}
            onChange={(value: string) => {
              onEditRole(value);
              setUserRole(value);
            }}
            options={OPTIONS}
            placeholder={ROLES[roleName]}
            size="s"
            status="none"
            theme="light"
          />
        </div>
      </div>
      <Tooltip
        arrow
        interactive
        popup
        visible={open}
        content={(
          <div className="flex flex-row p-2 space-x-3 text-sm text-gray-500 bg-white rounded-2xl">
            <Icon className="w-10 h-10" icon={USER_REMOVE_SVG} />
            <p>
              Are you sure you want to
              <br />
              remove
              <strong>
                {' '}
                {name}
                {' '}
              </strong>
              from
              <br />
              this project?
            </p>
            <div className="flex flex-col w-16 space-y-2">
              <Button
                theme="primary"
                size="xs"
                className="cursor-pointer"
                onClick={() => onDelete()}
              >
                Yes
              </Button>
              <Button
                data-close
                theme="tertiary"
                size="xs"
                className="cursor-pointer"
                onClick={() => setOpen(false)}
              >
                No
              </Button>
            </div>
          </div>
        )}
        placement="top-end"
      >
        <span>
          <Button
            className="flex-shrink-0 h-6 py-2 text-sm bg-gray-600 group"
            theme="secondary-alt"
            size="xs"
            onClick={() => setOpen(true)}
          >
            <span className="text-white group-hover:text-gray-600">Remove</span>
          </Button>
        </span>
      </Tooltip>
    </div>
  );
};

export default UserCard;
