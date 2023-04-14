import React, { useCallback, useState } from 'react';

import cx from 'classnames';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { useMe } from 'hooks/me';

export interface HeaderMyProjectsProps {}

export const HeaderMyProjects: React.FC<HeaderMyProjectsProps> = () => {
  const [hover, setHover] = useState(false);
  const { user } = useMe();
  const { asPath } = useRouter();

  const active = asPath.includes('projects');

  const handleMouseEnter = useCallback(() => {
    setHover(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover(false);
  }, []);

  if (!user) return null;

  return (
    <Link
      href="/projects"
      className="relative flex h-full items-center px-1 text-sm"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cx({
          'absolute left-1/2 top-0 h-1 -translate-x-1/2 transform bg-primary-500 transition-all':
            true,
          'w-full': hover || active,
          'w-0': !hover && !active,
        })}
      />
      <p className="text-xs md:text-sm">My projects</p>
    </Link>
  );
};

export default HeaderMyProjects;
