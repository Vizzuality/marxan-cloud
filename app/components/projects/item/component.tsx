import React, { useCallback, useState } from 'react';

import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlausible } from 'next-plausible';
import type { Project } from 'types/project-model';

import { useMe } from 'hooks/me';
import { useProject } from 'hooks/projects';

// import Avatar from 'components/avatar';
import Button from 'components/button';
import Icon from 'components/icon';

import ARROW_RIGHT_2_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ItemProps extends Project {
  id: string;
  className?: string;
  style?: Record<string, unknown>;
  lastUpdate: string;
  lastUpdateDistance: string;
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
  // contributors = [],
  style,
  onClick,
  onDownload,
  onDuplicate,
  onDelete,
}: ItemProps) => {
  const [animate, setAnimate] = useState('leave');
  const plausible = usePlausible();
  const { data: project } = useProject(id);
  const { user } = useMe();

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

  const handleDownload = useCallback((e) => {
    e.stopPropagation();
    onDownload(e);
    plausible('Download project', {
      props: {
        userId: `${user.id}`,
        userEmail: `${user.email}`,
        projectId: `${project.id}`,
        projectName: `${project.name}`,
      },
    });
  }, [onDownload, plausible, project, user]);

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
          'relative flex flex-col rounded-4xl bg-gray-800 px-8 py-10 text-white cursor-pointer text-left': true,
          [className]: !!className,
        })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <header className="flex-1 pr-5">
          <h3 className="text-xs font-medium tracking-widest uppercase font-heading">
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
        </header>

        {/* CONTRIBUTORS */}
        {/* {!!contributors.length && (
          <div className="flex items-center mt-4 text-sm">
            <p>Contributors:</p>
            <ul className="flex ml-1">
              {contributors.map((c, i) => {
                return (
                  <li
                    key={`${c.id}`}
                    className={cx({
                      '-ml-3': i !== 0,
                    })}
                  >
                    <Avatar bgImage="/images/avatar.png" />
                  </li>
                );
              })}
            </ul>
          </div>
        )} */}

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

            <Button
              className="ml-3"
              theme="secondary"
              size="xs"
              onClick={handleDuplicate}
            >
              Duplicate
            </Button>

            <Button
              className="ml-3"
              theme="secondary"
              size="xs"
              onClick={handleDelete}
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
