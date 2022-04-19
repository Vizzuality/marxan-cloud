import React, { useCallback, useState } from 'react';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';

import { useProjectsUsers, useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';

import EditDropdown from 'layout/projects/show/header/contributors/edit-dropdown';

import Avatar from 'components/avatar';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import ADD_USER_SVG from 'svgs/ui/add-user.svg?sprite';

export interface ContributorsProps {
}

export const Contributors: React.FC<ContributorsProps> = () => {
  const { query } = useRouter();
  const { pid } = query;

  const [open, setOpen] = useState(false);

  const { data = {} } = useProject(pid);
  const { data: projectsUsersData } = useProjectsUsers([pid]);

  const {
    data: projectUsers,
  } = useProjectUsers(pid);

  const projectUsersVisibleSize = 3;
  const projectUsersVisible = projectUsers?.slice(0, projectUsersVisibleSize);

  const handleClick = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const handleClickOutside = useCallback((tooltip, event) => {
    const $overlay = document.getElementById('overlay');
    const $select = document.querySelectorAll('.c-select-dropdown');
    const $multiselect = document.querySelectorAll('.c-multi-select-dropdown');

    const isSelect = !!$select && [...$select].some((s) => s.contains(event.target));
    const isMultiSelect = !!$multiselect && [...$multiselect].some((s) => s.contains(event.target));

    if (
      !((!!$overlay && $overlay.contains(event.target)) || isSelect || isMultiSelect)
    ) {
      setOpen(false);
    }
  }, [setOpen]);

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
                const {
                  user: {
                    email, displayName, id, avatarDataUrl,
                  },
                } = u;

                return (
                  <li
                    key={id}
                    className={cx({
                      '-ml-3': i !== 0,
                    })}
                  >
                    <Avatar
                      className="text-sm uppercase bg-primary-700"
                      bgImage={avatarDataUrl}
                      bgColor={projectsUsersData[id]}
                      name={displayName || email}
                    >
                      {!avatarDataUrl && (displayName || email).slice(0, 2)}
                    </Avatar>
                  </li>
                );
              })}

              {projectUsers?.length > projectUsersVisibleSize && (
                <Avatar className="-ml-3 text-sm text-white uppercase bg-primary-700">
                  {`+${projectUsers.length - projectUsersVisibleSize}`}
                </Avatar>
              )}

              <Tooltip
                placement="bottom-end"
                interactive
                popup
                visible={open}
                onClickOutside={handleClickOutside}
                zIndex={49}
                content={(
                  <EditDropdown />
                )}
              >
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
              </Tooltip>

            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Contributors;
