import React from 'react';
import cx from 'classnames';

import Link from 'next/link';

import Wrapper from 'layout/wrapper';
import User from 'layout/header/user';

import Icon from 'components/icon';
import Button from 'components/button';

import { useAuth } from 'hooks/authentication';
import { useProject } from 'hooks/projects';

import LOGO_SVG from 'svgs/logo.svg?sprite';
import { useRouter } from 'next/router';

export interface HeaderProps {
  size: 'base' | 'lg',
}

const SIZE = {
  base: {
    logo: 'h-12 w-28',
  },
  lg: {
    logo: 'h-20 w-36',
  },
};

export const Header: React.FC<HeaderProps> = ({ size }:HeaderProps) => {
  const auth = useAuth();
  const { query } = useRouter();
  const { pid } = query;
  const { data: projectData } = useProject(pid);

  return (
    <header
      className="w-full row-auto"
    >
      <Wrapper>
        <nav className="relative flex flex-wrap items-center justify-between py-1 bg-black navbar-expand-lg">
          <Link
            href="/"
          >
            <a href="/">
              <Icon
                icon={LOGO_SVG}
                className={cx({
                  [`${SIZE[size].logo}`]: true,
                })}
              />
            </a>
          </Link>

          {projectData?.name && (
            <h1 className="font-medium font-heading">{projectData.name}</h1>
          )}

          {auth.user && (
            <User />
          )}

          {!auth.user && (
            <div className="flex items-center gap-4">
              <Link href="sign-in">
                <Button theme="secondary-alt" size="s">
                  Sign in
                </Button>
              </Link>

              <Link href="sign-up">
                <Button theme="primary" size="s">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </Wrapper>
    </header>
  );
};

export default Header;
