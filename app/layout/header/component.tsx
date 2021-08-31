import React from 'react';

import Link from 'next/link';

import cx from 'classnames';

import { useMe } from 'hooks/me';

import MyProjects from 'layout/header/my-projects';
import Title from 'layout/header/title';
import User from 'layout/header/user';
import Wrapper from 'layout/wrapper';

import LinkButton from 'components/button';

import LOGO_BLACK from 'svgs/logo-black.svg';
import LOGO_SVG from 'svgs/logo.svg';

export interface HeaderProps {
  published?: boolean;
  size: 'base' | 'lg',
  theme?: 'dark' | 'light',
}

const SIZE = {
  base: {
    logo: {
      width: 116,
      height: 47,
    },
  },
  lg: {
    logo: {
      width: 148,
      height: 60,
    },
  },
};

export const Header: React.FC<HeaderProps> = ({ published = false, size, theme = 'dark' }: HeaderProps) => {
  const { user } = useMe();

  return (
    <header
      className={cx({
        'w-full row-auto': true,
        'bg-primary-50 text-gray-800': theme === 'light',
      })}
    >
      <Wrapper>
        <nav className="relative flex flex-wrap items-center justify-between mt-10 md:mt-0 navbar-expand-lg">
          <Link
            href="/"
          >
            <a href="/">
              <img
                alt="Marxan logo"
                src={theme === 'light' ? LOGO_BLACK : LOGO_SVG}
                style={SIZE[size].logo}
              />
            </a>
          </Link>

          {!published && (
            <Title />
          )}

          <div
            className={cx({
              'flex items-center space-x-1 md:space-x-5': true,
              'divide-x divide-gray-500': theme === 'dark',
            })}
            style={{
              height: SIZE[size].logo.height + 10,
            }}
          >
            <MyProjects />

            <div className="flex items-center h-full pl-1 md:pl-5">
              <User />
            </div>
          </div>

          {!user && (
            <div className="flex items-center space-x-4">
              <LinkButton
                href="/auth/sign-in"
                theme={cx({
                  clear: theme === 'light',
                  'secondary-alt': theme !== 'light',
                })}
                size="s"
              >
                Sign in
              </LinkButton>

              <LinkButton href="/auth/sign-up" theme="primary" size="s">
                Sign up
              </LinkButton>
            </div>
          )}
        </nav>
      </Wrapper>
    </header>
  );
};

export default Header;
