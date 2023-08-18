import React from 'react';

import cx from 'classnames';

import Link from 'next/link';

import { useMe } from 'hooks/me';

import LinkButton from 'components/button';
import Title from 'layout/header/title';
import Breadcrumbs from 'layout/project/navigation/breadcrumbs';
import Wrapper from 'layout/wrapper';
import { cn } from 'utils/cn';

import LOGO_BLACK_SVG from 'svgs/logo-black.svg';
import LOGO_SVG from 'svgs/logo.svg';

export interface HeaderProps {
  className?: string;
  published?: boolean;
  maintenance?: boolean;
  size: 'base' | 'lg';
  theme?: 'dark' | 'light' | 'transparent';
}

const SIZE = {
  base: {
    logo: {
      height: 47,
    },
  },
  lg: {
    logo: {
      height: 60,
    },
  },
};

export const Header = ({
  className,
  published = false,
  maintenance = false,
  size,
  theme = 'dark',
}: HeaderProps): JSX.Element => {
  const { user } = useMe();

  return (
    <>
      <header
        className={cn({
          [className]: true,
          'z-10 row-auto w-full': true,
          'bg-black text-white': theme === 'dark',
          'bg-primary-50 text-gray-800': theme === 'light',
          'py-1.5': maintenance,
        })}
      >
        <Wrapper>
          <nav className="navbar-expand-lg relative mt-10 flex flex-wrap items-center justify-between md:mt-0">
            {!user && (
              <Link href="/">
                <img
                  alt="Marxan logo"
                  src={theme === 'light' ? LOGO_BLACK_SVG : LOGO_SVG}
                  style={SIZE[size].logo}
                />
              </Link>
            )}
            {user && (
              <div className="pt-8">
                <Breadcrumbs />
              </div>
            )}
            {!published && <Title />}

            {!maintenance && (
              <>
                {!user && (
                  <div
                    className="flex items-center space-x-4"
                    style={{
                      height: SIZE[size].logo.height + 10,
                    }}
                  >
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
              </>
            )}
          </nav>
        </Wrapper>
      </header>
    </>
  );
};

export default Header;
