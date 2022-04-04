import React, { useCallback, useMemo, useState } from 'react';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { useDebouncedCallback } from 'use-debounce';

import { useOwnsProject } from 'hooks/permissions';
import {
  useProjectsUsers, useProjectUsers, useSaveProjectUserRole, useUserByEmail,
} from 'hooks/project-users';
import { useToasts } from 'hooks/toast';

import UserCard from 'layout/projects/show/header/contributors/edit-dropdown/card';

import Button from 'components/button';
import Search from 'components/search';

export interface EditContributorsDropdownProps {
}

export const EditContributorsDropdown: React.FC<EditContributorsDropdownProps> = () => {
  const { query } = useRouter();
  const { pid } = query;

  const { addToast } = useToasts();

  const [search, setSearch] = useState(null);
  const [email, setEmail] = useState(null);

  const isOwner = useOwnsProject(pid);

  const {
    data: userByEmailData,
    isFetched: userByEmailIsFetched,
  } = useUserByEmail(email);

  const {
    data: projectUsersData,
  } = useProjectUsers(pid);

  const { data: projectsUsersData } = useProjectsUsers([pid]);

  const saveProjectUserRoleMutation = useSaveProjectUserRole({});

  const SEARCH_RESULT = useMemo(() => {
    if (projectUsersData?.find((pu) => pu?.user?.id === userByEmailData?.id)) {
      return null;
    }

    return userByEmailData;
  }, [userByEmailData, projectUsersData]);

  const onChangeEmailDebounced = useDebouncedCallback((value) => {
    setEmail(value);
  }, 500);

  const onChangeSearch = useCallback((value) => {
    setSearch(value);
    onChangeEmailDebounced(value);
  }, [onChangeEmailDebounced]);

  const addUser = useCallback(() => {
    saveProjectUserRoleMutation.mutate({
      projectId: `${pid}`,
      data: {
        userId: userByEmailData.id,
        projectId: `${pid}`,
        roleName: 'project_contributor',
      },
    }, {
      onSuccess: () => {
        addToast('add-conttributor-success', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">
              {userByEmailData.displayName || userByEmailData.email}
              {' '}
              added as contributor
            </p>
          </>
        ), {
          level: 'success',
        });

        setSearch(null);
        setEmail(null);
      },
      onError: () => {
        addToast('add-conttributor-error', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              Something went wrong, please try again.
            </p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [pid, userByEmailData, saveProjectUserRoleMutation, addToast]);

  const contributorsSpelling = projectUsersData?.length !== 1 ? 'contributors' : 'contributor';

  return (
    <div className="overflow-x-visible overflow-y-auto bg-white p-9 rounded-3xl">
      <div className="flex flex-col space-y-5 w-96">
        <div className="text-sm text-center text-black">Project members</div>

        {isOwner && (
          <div>
            <Search
              id="user-search"
              size="sm"
              value={search}
              placeholder="Search connections..."
              aria-label="Search"
              onChange={onChangeSearch}
              theme="light"
            />

            {SEARCH_RESULT && userByEmailIsFetched && (
              <div className="flex justify-between pt-2 pr-5 text-black pl-9">
                <div className="text-sm">{SEARCH_RESULT.displayName || SEARCH_RESULT.email}</div>

                <Button
                  className={cx({
                    'flex-shrink-0 h-6 py-2 text-sm  group': true,
                  })}
                  theme="primary"
                  size="xs"
                  onClick={addUser}
                >
                  Add
                </Button>
              </div>
            )}

            {!SEARCH_RESULT && userByEmailIsFetched && (
              <div className="flex justify-between pt-2 pr-5 text-black pl-9">
                <div className="text-sm">No results</div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col space-y-2.5">
          <p className="text-xs text-black uppercase font-heading">{`${projectUsersData?.length} ${contributorsSpelling}`}</p>
          <div className="w-full space-y-2.5 flex-grow flex flex-col overflow-x-visible overflow-y-auto max-h-64">
            {!!projectUsersData?.length && projectUsersData.map((u) => {
              const {
                user: {
                  email: userEmail, displayName, id, avatarDataUrl,
                }, roleName,
              } = u;

              return (
                <UserCard
                  key={id}
                  id={id}
                  name={displayName || userEmail}
                  roleName={roleName}
                  bgImage={avatarDataUrl}
                  bgColor={projectsUsersData[id]}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditContributorsDropdown;
