import React, { useCallback, useState } from 'react';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import { useProjectsUsers, useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';

import Avatar from 'components/avatar';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';
import EditDropdown from 'layout/projects/show/header/contributors/edit-dropdown';
import { cn } from 'utils/cn';

import ADD_USER_SVG from 'svgs/ui/add-user.svg?sprite';

export const Contributors: React.FC = () => {
  const { query } = useRouter();
  const { pid } = query;

  const [open, setOpen] = useState(false);

  const { data = {} } = useProject(pid);
  const { data: projectsUsersData } = useProjectsUsers([pid]);

  const { data: projectUsers } = useProjectUsers(pid);

  const projectUsersVisibleSize = 3;
  const projectUsersVisible = projectUsers?.slice(0, projectUsersVisibleSize);

  const handleClick = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const handleClickOutside = useCallback(
    (event) => {
      const $overlay = document.getElementById('overlay');
      const $select = document.querySelectorAll('.c-select-dropdown');
      const $multiselect = document.querySelectorAll('.c-multi-select-dropdown');

      const isSelect = !!$select && [...$select].some((s) => s.contains(event.target));
      const isMultiSelect =
        !!$multiselect && [...$multiselect].some((s) => s.contains(event.target));

      if (!((!!$overlay && $overlay.contains(event.target)) || isSelect || isMultiSelect)) {
        setOpen(false);
      }
    },
    [setOpen]
  );

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
            <ul className="ml-2.5 flex">
              {!!projectUsersVisible?.length &&
                projectUsersVisible.map((u, i) => {
                  const {
                    user: { email, displayName, id, avatarDataUrl },
                  } = u;

                  return (
                    <li
                      key={id}
                      className={cn({
                        '-ml-3': i !== 0,
                      })}
                    >
                      <Avatar
                        size="s"
                        className="border-none bg-primary-700 text-xs uppercase"
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
                <Avatar size="s" className="-ml-3 bg-primary-700 text-sm uppercase text-white">
                  {`+${projectUsers.length - projectUsersVisibleSize}`}
                </Avatar>
              )}

              <Tooltip
                animation
                placement="bottom-end"
                interactive
                popup
                visible={open}
                onClickOutside={handleClickOutside}
                zIndex={49}
                content={<EditDropdown />}
              >
                <button
                  aria-label="add-contributor"
                  type="button"
                  className={cn({
                    'z-50 -ml-3 rounded-full border border-gray-500 hover:border-white': true,
                    'bg-gray-500': !open,
                  })}
                  onClick={handleClick}
                >
                  <Avatar
                    size="s"
                    className={cn({
                      'border-none': true,
                      'bg-gray-500 text-white': !open,
                      'bg-white text-gray-500': open,
                    })}
                  >
                    <Icon icon={ADD_USER_SVG} className="h-4 w-4" />
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
