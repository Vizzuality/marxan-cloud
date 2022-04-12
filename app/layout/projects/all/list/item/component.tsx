import React, { useCallback, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlausible } from 'next-plausible';
import type { Project } from 'types/project-model';
import { ROLES } from 'utils/constants-roles';

import { useMe } from 'hooks/me';
import { useOwnsProject, useProjectRole } from 'hooks/permissions';
import { useProjectUsers } from 'hooks/project-users';
import { useSaveProjectDownload } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import ComingSoon from 'layout/help/coming-soon';

import Avatar from 'components/avatar';
import Button from 'components/button';
import Icon from 'components/icon';

import ARROW_RIGHT_2_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ItemProps extends Project {
  id: string;
  className?: string;
  style?: Record<string, unknown>;
  lastUpdate: string;
  lastUpdateDistance: string;
  userColors?: Record<string, string>;
  isPublic: boolean;
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
  onClick,
  onDuplicate,
  onDelete,
}: ItemProps) => {
  const [animate, setAnimate] = useState('leave');
  const plausible = usePlausible();
  const { addToast } = useToasts();

  const { user } = useMe();

  const { data: projectRole } = useProjectRole(id);

  const isOwner = useOwnsProject(id);

  const { data: projectUsers } = useProjectUsers(id);
  const {
    data: scenariosData,
  } = useScenarios(id, {
    filters: { projectId: id },
    sort: '-lastModifiedAt',
  });

  const projectDownloadMutation = useSaveProjectDownload({});

  const scenarioIds = useMemo(() => {
    return scenariosData?.map((scenario) => scenario.id);
  }, [scenariosData]);

  const projectUsersVisibleSize = 3;
  const projectUsersVisible = projectUsers?.slice(0, projectUsersVisibleSize);

  const handleMouseEnter = useCallback(() => {
    setAnimate('enter');
  }, [setAnimate]);

  const handleMouseLeave = useCallback(() => {
    setAnimate('leave');
  }, [setAnimate]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onClick(e);
  }, [onClick]);

  const handleDownload = useCallback(() => {
    projectDownloadMutation.mutate({ id: `${id}`, data: { scenarioIds } }, {

      onSuccess: () => {
      },
      onError: () => {
        addToast('error-download-project', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              Unable to download project
              {' '}
              {name}
            </p>
          </>
        ), {
          level: 'error',
        });
      },
    });
    plausible('Download project', {
      props: {
        userId: `${user.id}`,
        userEmail: `${user.email}`,
        projectId: `${id}`,
        projectName: `${name}`,
      },
    });
  }, [
    plausible,
    id,
    name,
    user,
    addToast,
    scenarioIds,
    projectDownloadMutation,
  ]);

  const handleDuplicate = useCallback((e) => {
    e.stopPropagation();
    onDuplicate(e);
  }, [onDuplicate]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(e);
  }, [onDelete]);

  return (
    <AnimatePresence>
      <div
        role="presentation"
        style={style}
        className={cx({
          'relative flex flex-col rounded-4xl bg-gray-800 px-7 py-8 text-white cursor-pointer text-left': true,
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
                className={cx({
                  'px-2.5 py-1 text-sm rounded-3xl opacity-0 transition-opacity': true,
                  'opacity-100': !!ROLES[projectRole],
                  'bg-yellow-500 bg-opacity-20': isOwner,
                  'border border-gray-500': !isOwner,
                })}
              >
                <p className={cx({
                  'text-yellow-500': isOwner,
                  'text-white': !isOwner,
                })}
                >
                  {ROLES[projectRole]}
                </p>
              </div>

              {isPublic && (
                <div
                  className={cx({
                    'px-2.5 py-1 text-sm rounded-3xl opacity-0 transition-opacity': true,
                    'opacity-100 bg-primary-500 bg-opacity-20': !!ROLES[projectRole],
                  })}
                >
                  <p className={cx({
                    'text-primary-500': ROLES[projectRole],
                  })}
                  >
                    Public
                  </p>
                </div>
              )}

            </div>

            <div
              className={cx({
                'inline-flex opacity-0 transition-opacity': true,
                'opacity-100': !isEmpty(userColors),
              })}
            >
              <div className="flex items-center text-sm">
                <ul className="flex">
                  {!!projectUsersVisible?.length && projectUsersVisible.map((u, i) => {
                    const { user: { displayName, id: userId, avatarDataUrl } } = u;

                    return (
                      <li
                        key={userId}
                        className={cx({
                          '-ml-3': i !== 0,
                        })}
                      >
                        <Avatar
                          className="text-sm uppercase"
                          bgColor={userColors[userId]}
                          bgImage={avatarDataUrl}
                          name={displayName}
                        >
                          {!avatarDataUrl && displayName.slice(0, 2)}
                        </Avatar>
                      </li>
                    );
                  })}

                  {projectUsers?.length > projectUsersVisibleSize && (
                    <Avatar
                      className="-ml-3 text-sm text-white uppercase bg-primary-700"
                    >
                      {`+${projectUsers.length - projectUsersVisibleSize}`}
                    </Avatar>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-medium tracking-widest uppercase font-heading pt-7">
            {area}
          </h3>

          <div className="relative">
            <motion.div
              className="absolute left-0 h-full transform -translate-y-1/2 bg-primary-500 top-1/2"
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
              className="mt-3 mb-10 text-lg font-medium break-words font-heading"
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
            <span className="ml-2 text-primary-500">
              {lastUpdateDistance || 'no scenario'}
            </span>
          </div>
          <div className="text-sm opacity-50 clamp-2">{description}</div>
        </div>

        <footer className="mt-7">
          <div className="flex">

            <Button
              className=""
              theme="secondary"
              size="xs"
              onClick={handleDownload}
            >
              Download
            </Button>

            <ComingSoon>
              <Button
                className="ml-3"
                theme="secondary"
                size="xs"
                onClick={handleDuplicate}
              >
                Duplicate
              </Button>
            </ComingSoon>

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
          className="absolute transform -translate-y-1/2 right-4 top-1/2"
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
          <Icon icon={ARROW_RIGHT_2_SVG} className="w-5 h-5 text-white opacity-25" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Item;
