import React, { useCallback, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import cx from 'classnames';

import { useMe } from 'hooks/me';

export interface HeaderMyProjectsProps {
}

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
    (
      <Link
        href="/projects"
        className="relative flex items-center h-full px-1 text-sm"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        <div
          className={cx({
            'absolute top-0 left-1/2 h-1 transform -translate-x-1/2 bg-primary-500 transition-all': true,
            'w-full': hover || active,
            'w-0': !hover && !active,
          })}
        />
        <p className="text-xs md:text-sm">My projects</p>

      </Link>
    )
  );
};

export default HeaderMyProjects;
