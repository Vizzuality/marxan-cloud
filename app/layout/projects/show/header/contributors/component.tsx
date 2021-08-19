import React from 'react';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';

import { useProject } from 'hooks/projects';

import Avatar from 'components/avatar';
import Icon from 'components/icon';

import ADD_USER_SVG from 'svgs/ui/add-user.svg?sprite';

export interface ContributorsProps {
}

const USERS = [
  { id: 1, avatarDataUrl: '/images/avatar.png', displayName: 'Hello' },
  { id: 2, avatarDataUrl: null, displayName: 'Hello 2' },
  { id: 3, avatarDataUrl: null, displayName: 'Hello 3' },
];

export const Contributors: React.FC<ContributorsProps> = () => {
  const { query } = useRouter();
  const { pid } = query;
  const { data = {} } = useProject(pid);
  const { users = USERS } = data;

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
              {!!users && users.length && users.map((u, i) => {
                return (
                  <li
                    key={u.id}
                    className={cx({
                      '-ml-3': i !== 0,
                    })}
                  >
                    <Avatar className="text-sm text-white uppercase bg-primary-700" bgImage={u.avatarDataUrl} name={u.displayName}>
                      {!u.avatarDataUrl && u.displayName.slice(0, 2)}
                    </Avatar>
                  </li>
                );
              })}

              <li className="ml-3">
                <button
                  type="button"
                  onClick={() => {
                    console.info('Add contributor');
                  }}
                >
                  <Avatar className="text-sm text-white uppercase bg-gray-500">
                    <Icon icon={ADD_USER_SVG} className="w-4 h-4" />
                  </Avatar>
                </button>
              </li>

            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Contributors;
