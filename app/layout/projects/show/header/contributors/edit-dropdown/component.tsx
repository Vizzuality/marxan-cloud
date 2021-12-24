import React, { useEffect } from 'react';

import { useDebouncedCallback } from 'use-debounce';

import UserCard from 'layout/projects/show/header/contributors/edit-dropdown/card';

import Search from 'components/search';

export interface EditContributorsDropdownProps {
  users: any,
  search?: string;
  onSearch: (selected: string) => void;
  refetch: () => void;
}

export const EditContributorsDropdown: React.FC<EditContributorsDropdownProps> = ({
  users, search, onSearch, refetch,
}: EditContributorsDropdownProps) => {
  const onChangeSearchDebounced = useDebouncedCallback((value) => {
    onSearch(value);
  }, 500);

  useEffect(() => {
    return function unmount() {
      onSearch(null);
    };
  }, [onSearch]);

  const contributorsSpelling = users.length !== 1 ? 'contributors' : 'contributor';

  return (
    <div className="absolute z-40 overflow-x-visible overflow-y-auto bg-white top-14 -right-2 p-9 rounded-3xl">
      <div className="flex flex-col items-center w-96">
        <div className="text-sm text-black pb-9">Project members</div>
        <Search
          id="user-search"
          size="base"
          defaultValue={search}
          placeholder="Search connections..."
          aria-label="Search"
          onChange={onChangeSearchDebounced}
          theme="light"
        />
        <p className="self-start py-6 text-xs text-black uppercase font-heading">{`${users.length} ${contributorsSpelling}`}</p>
        <div className="w-full space-y-2.5 flex-grow flex flex-col overflow-x-visible overflow-y-auto max-h-64">
          {!!users.length && users.map((u) => {
            const {
              user: {
                displayName, id, avatarDataUrl,
              }, roleName,
            } = u;

            return (
              <UserCard
                key={id}
                id={id}
                image={avatarDataUrl}
                name={displayName}
                roleName={roleName}
                refetch={refetch}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EditContributorsDropdown;
