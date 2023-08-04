import React, { useState } from 'react';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import { useProjectsUsers, useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';

import Avatar from 'components/avatar';
import Icon from 'components/icon';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import { cn } from 'utils/cn';

import ADD_USER_SVG from 'svgs/ui/add-user.svg?sprite';

import EditDropdown from './edit-dropdown';

const PROJECT_USERS_SIZE = 3;

export const Contributors = (): JSX.Element => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const [open, setOpen] = useState(false);

  const { data } = useProject(pid);

  const { data: projectsUsersData } = useProjectsUsers([pid]);

  const { data: projectUsers } = useProjectUsers(pid);

  const projectUsersVisible = projectUsers?.slice(0, PROJECT_USERS_SIZE);

  const handleClick = () => setOpen((open) => !open);

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

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    aria-label="add-contributor"
                    type="button"
                    className={cn({
                      'z-50 -ml-3 h-8 w-8 rounded-full': true,
                      'bg-gray-500': !open,
                    })}
                    onClick={handleClick}
                  >
                    <Avatar
                      size="s"
                      className={cn({
                        'border-none': true,
                        'bg-gray-500 text-white transition-colors hover:bg-white hover:text-gray-500':
                          !open,
                        'bg-white text-gray-500': open,
                      })}
                    >
                      <Icon icon={ADD_USER_SVG} className="h-4 w-4" />
                    </Avatar>
                  </button>
                </PopoverTrigger>
                {open && (
                  <PopoverContent
                    side="right"
                    sideOffset={20}
                    className="!z-50 w-full rounded-2xl !border-none bg-gray-700 !p-0 font-sans text-xs"
                    collisionPadding={48}
                    onInteractOutside={() => setOpen(false)}
                  >
                    <EditDropdown />
                  </PopoverContent>
                )}
              </Popover>
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Contributors;
