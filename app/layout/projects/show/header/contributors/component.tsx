import React, { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';

import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';

import EditDropdown from 'layout/projects/show/header/contributors/edit-dropdown';

import Avatar from 'components/avatar';
import Icon from 'components/icon';

import ADD_USER_SVG from 'svgs/ui/add-user.svg?sprite';

export interface ContributorsProps {
}

export const Contributors: React.FC<ContributorsProps> = () => {
  const { query } = useRouter();
  const { pid } = query;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(null);

  const { data = {} } = useProject(pid);

  const {
    data: projectUsers,
    refetch: refetchProjectUsers,
  } = useProjectUsers(pid, { search });

  const projectUsersVisibleSize = 3;
  const projectUsersVisible = projectUsers?.slice(0, projectUsersVisibleSize);

  useEffect(() => {
    refetchProjectUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleClick = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const onSearch = useCallback((s) => {
    setSearch(s);
  }, []);

  return (
    <AnimatePresence>
      {data?.name && (
        <motion.div
          key="project-contributors"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <div className="flex items-center">
            <div className="text-sm">Contributors to this project:</div>

            <ul className="flex ml-2.5">
              {!!projectUsersVisible?.length && projectUsersVisible.map((u, i) => {
                const { user: { displayName, id, avatarDataUrl } } = u;
                return (
                  <li
                    key={id}
                    className={cx({
                      '-ml-3': i !== 0,
                    })}
                  >
                    <Avatar
                      className="text-sm text-white uppercase bg-primary-700"
                      bgImage={avatarDataUrl}
                      name={displayName}
                    >
                      {!avatarDataUrl && displayName.slice(0, 2)}
                    </Avatar>
                  </li>
                );
              })}

              {projectUsers?.length > projectUsersVisibleSize && (
                <Avatar className="-ml-3 text-sm text-white uppercase bg-primary-700">
                  {`+${projectUsers.length - projectUsersVisibleSize}`}
                </Avatar>
              )}

              <div className="relative ml-3">
                <button
                  aria-label="add-contributor"
                  type="button"
                  className="border border-transparent rounded-full hover:border hover:border-white"
                  onClick={handleClick}
                >
                  <Avatar className={cx({
                    'text-white bg-gray-500': !open,
                    'bg-white text-gray-500': open,
                  })}
                  >
                    <Icon icon={ADD_USER_SVG} className="w-4 h-4" />
                  </Avatar>

                </button>

                {open && (
                  <EditDropdown
                    users={projectUsers}
                    search={search}
                    onSearch={onSearch}
                  />
                )}

              </div>

            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Contributors;
