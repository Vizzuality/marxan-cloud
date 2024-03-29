import React, { useCallback, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import isEmpty from 'lodash/isEmpty';

import { useOwnsProject, useProjectRole } from 'hooks/permissions';
import { useProjectUsers } from 'hooks/project-users';

import Avatar from 'components/avatar';
import Button from 'components/button';
import Icon from 'components/icon';
import type { Project } from 'types/api/project';
import { cn } from 'utils/cn';
import { ROLES } from 'utils/constants-roles';

import ARROW_RIGHT_2_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ItemProps extends Project {
  id: string;
  className?: string;
  style?: Record<string, unknown>;
  lastUpdate: string;
  lastUpdateDistance: string;
  userColors?: Record<string, string>;
  isPublic: boolean;
  underModeration: boolean;
  scenarios: Record<string, any>;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDownload: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDuplicate: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Item: React.FC<ItemProps> = ({
  id,
  className,
  name,
  area,
  description,
  lastUpdateDistance,
  style,
  userColors,
  isPublic,
  underModeration,
  onClick,
  onDownload,
  onDuplicate,
  onDelete,
}: ItemProps) => {
  const [animate, setAnimate] = useState('leave');

  const { data: projectRole } = useProjectRole(id);

  const isOwner = useOwnsProject(id);

  const { data: projectUsers } = useProjectUsers(id);

  const projectUsersVisibleSize = 3;
  const projectUsersVisible = projectUsers?.slice(0, projectUsersVisibleSize);

  const handleMouseEnter = useCallback(() => {
    setAnimate('enter');
  }, [setAnimate]);

  const handleMouseLeave = useCallback(() => {
    setAnimate('leave');
  }, [setAnimate]);

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      onClick(e);
    },
    [onClick]
  );

  const handleDownload = useCallback(
    (e) => {
      e.stopPropagation();
      onDownload(e);
    },
    [onDownload]
  );

  const handleDuplicate = useCallback(
    (e) => {
      e.stopPropagation();
      onDuplicate(e);
    },
    [onDuplicate]
  );

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      onDelete(e);
    },
    [onDelete]
  );

  return (
    <AnimatePresence>
      <div
        role="presentation"
        style={style}
        className={cn({
          'relative flex cursor-pointer flex-col rounded-[40px] bg-gray-900 px-7 py-8 text-left text-white':
            true,
          [className]: !!className,
        })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div className="flex-1">
          <div
            className="flex items-center justify-between"
            style={{
              minHeight: 40,
            }}
          >
            <div className="flex space-x-2">
              <div
                className={cn({
                  'rounded-3xl px-2.5 py-1 text-sm opacity-0 transition-opacity': true,
                  'opacity-100': !!ROLES[projectRole],
                  'bg-yellow-600 bg-opacity-20': isOwner,
                  'border border-gray-600': !isOwner,
                })}
              >
                <p
                  className={cn({
                    'text-yellow-600': isOwner,
                    'text-white': !isOwner,
                  })}
                >
                  {ROLES[projectRole]}
                </p>
              </div>

              {isPublic && (
                <div
                  className={cn({
                    'rounded-3xl px-2.5 py-1 text-sm opacity-0 transition-opacity': true,
                    'bg-primary-500 bg-opacity-20 opacity-100': !!ROLES[projectRole],
                  })}
                >
                  <p
                    className={cn({
                      'text-primary-500': ROLES[projectRole],
                    })}
                  >
                    {!underModeration && 'Public'}
                    {underModeration && 'Under moderation'}
                  </p>
                </div>
              )}
            </div>

            <div
              className={cn({
                'inline-flex opacity-0 transition-opacity': true,
                'opacity-100': !isEmpty(userColors),
              })}
            >
              <div className="flex items-center text-sm">
                <ul className="flex">
                  {!!projectUsersVisible?.length &&
                    projectUsersVisible.map((u, i) => {
                      const {
                        user: { email, displayName, id: userId, avatarDataUrl },
                      } = u;

                      return (
                        <li
                          key={userId}
                          className={cn({
                            '-ml-3': i !== 0,
                          })}
                        >
                          <Avatar
                            className="text-sm uppercase"
                            bgColor={userColors[userId]}
                            bgImage={avatarDataUrl}
                            name={displayName || email}
                          >
                            {!avatarDataUrl && (displayName || email).slice(0, 2)}
                          </Avatar>
                        </li>
                      );
                    })}

                  {projectUsers?.length > projectUsersVisibleSize && (
                    <Avatar className="-ml-3 bg-primary-700 text-sm uppercase text-white">
                      {`+${projectUsers.length - projectUsersVisibleSize}`}
                    </Avatar>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <h3 className="pt-7 font-heading text-xs font-medium uppercase tracking-widest">
            {area}
          </h3>

          <div className="relative">
            <motion.div
              className="absolute left-0 top-1/2 h-full -translate-y-1/2 transform bg-primary-500"
              style={{
                width: 3,
              }}
              initial={{
                height: '0%',
                y: '-50%',
              }}
              animate={animate}
              variants={{
                enter: {
                  height: '100%',
                  y: '-50%',
                  transition: {
                    delay: 0.1,
                  },
                },
                leave: {
                  height: '0%',
                  y: '-50%',
                  transition: {
                    delay: 0,
                  },
                },
              }}
            />

            <motion.h2
              className="mb-10 mt-3 break-words font-heading text-lg font-medium"
              initial={{
                x: 0,
              }}
              animate={animate}
              variants={{
                enter: {
                  x: 15,
                  transition: {
                    delay: 0.1,
                  },
                },
                leave: {
                  x: 0,
                  transition: {
                    delay: 0.1,
                  },
                },
              }}
              transition={{
                ease: 'anticipate',
              }}
            >
              {name}
            </motion.h2>
          </div>

          <div className="mb-3 text-sm">
            <span>Last update:</span>
            <span className="ml-2 text-primary-500">{lastUpdateDistance || 'no scenario'}</span>
          </div>
          <div className="line-clamp-2 text-sm opacity-50">{description}</div>
        </div>

        <footer className="mt-7">
          <div className="flex">
            <Button className="" theme="secondary" size="xs" onClick={handleDownload}>
              Download
            </Button>

            <Button className="ml-3" theme="secondary" size="xs" onClick={handleDuplicate}>
              Duplicate
            </Button>

            <Button
              className="ml-3"
              theme="secondary"
              size="xs"
              onClick={handleDelete}
              disabled={!isOwner}
            >
              Delete
            </Button>
          </div>
        </footer>

        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 transform"
          initial={{
            opacity: 0,
            x: -10,
            y: '-50%',
          }}
          animate={animate}
          variants={{
            enter: {
              opacity: 1,
              x: 0,
              y: '-50%',
            },
            leave: {
              opacity: 0,
              x: -10,
              y: '-50%',
            },
          }}
          transition={{
            ease: 'anticipate',
          }}
        >
          <Icon icon={ARROW_RIGHT_2_SVG} className="h-5 w-5 text-white opacity-25" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Item;
