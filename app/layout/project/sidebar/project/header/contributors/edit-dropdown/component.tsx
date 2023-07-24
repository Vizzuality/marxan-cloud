import React, { useCallback, useMemo, useState } from 'react';

import cx from 'classnames';

import { useRouter } from 'next/router';

import { useDebouncedCallback } from 'use-debounce';

import { useOwnsProject } from 'hooks/permissions';
import {
  useProjectsUsers,
  useProjectUsers,
  useSaveProjectUserRole,
  useUserByEmail,
} from 'hooks/project-users';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Search from 'components/search';

import UserCard from './card';

export const EditContributorsDropdown: React.FC = () => {
  const { query } = useRouter();
  const { pid } = query;

  const { addToast } = useToasts();

  const [search, setSearch] = useState<string>(null);
  const [email, setEmail] = useState<boolean>(null);

  const isOwner = useOwnsProject(pid);

  const { data: userByEmailData, isFetched: userByEmailIsFetched } = useUserByEmail(email);

  const { data: projectUsersData } = useProjectUsers(pid);

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

  const onChangeSearch = useCallback(
    (value) => {
      setSearch(value);
      onChangeEmailDebounced(value);
    },
    [onChangeEmailDebounced]
  );

  const addUser = useCallback(() => {
    saveProjectUserRoleMutation.mutate(
      {
        projectId: `${pid}`,
        data: {
          userId: userByEmailData.id,
          projectId: `${pid}`,
          roleName: 'project_contributor',
        },
      },
      {
        onSuccess: () => {
          addToast(
            'add-conttributor-success',
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">
                {userByEmailData.displayName || userByEmailData.email} added as contributor
              </p>
            </>,
            {
              level: 'success',
            }
          );

          setSearch(null);
          setEmail(null);
        },
        onError: () => {
          addToast(
            'add-conttributor-error',
            <>
              <h2 className="font-medium">Error!</h2>
              <p className="text-sm">Something went wrong, please try again.</p>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
  }, [pid, userByEmailData, saveProjectUserRoleMutation, addToast]);

  const contributorsSpelling = projectUsersData?.length !== 1 ? 'contributors' : 'contributor';

  return (
    <div className="overflow-y-auto overflow-x-visible rounded-3xl bg-white p-9">
      <div className="flex w-96 flex-col space-y-5">
        <div className="text-center text-sm text-black">Project members</div>

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
              <div className="flex justify-between pl-9 pr-5 pt-2 text-black">
                <div className="text-sm">{SEARCH_RESULT.displayName || SEARCH_RESULT.email}</div>

                <Button
                  className={cx({
                    'group h-6 flex-shrink-0 py-2  text-sm': true,
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
              <div className="flex justify-between pl-9 pr-5 pt-2 text-black">
                <div className="text-sm">No results</div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col space-y-2.5">
          <p className="font-heading text-xs uppercase text-black">{`${projectUsersData?.length} ${contributorsSpelling}`}</p>
          <div className="flex max-h-64 w-full flex-grow flex-col space-y-2.5 overflow-y-auto overflow-x-visible">
            {!!projectUsersData?.length &&
              projectUsersData.map((u) => {
                const {
                  user: { email: userEmail, displayName, id, avatarDataUrl },
                  roleName,
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
