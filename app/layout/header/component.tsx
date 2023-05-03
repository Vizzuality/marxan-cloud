import React from 'react';

import cx from 'classnames';

import Link from 'next/link';

import { useMe } from 'hooks/me';

// import Beta from 'layout/beta';
import LinkButton from 'components/button';
import MyProjects from 'layout/header/my-projects';
import Title from 'layout/header/title';
import User from 'layout/header/user';
import Wrapper from 'layout/wrapper';

// import LOGO_SVG from 'images/logo-beta.png';

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

export const Header: React.FC<HeaderProps> = ({
  className,
  published = false,
  maintenance = false,
  size,
  theme = 'dark',
}: HeaderProps) => {
  const { user } = useMe();

  return (
    <>
      {/* <Beta /> */}

      <header
        className={cx({
          [className]: true,
          'z-10 row-auto w-full': true,
          'bg-black text-white': theme === 'dark',
          'bg-primary-50 text-gray-800': theme === 'light',
          'py-1.5': maintenance,
        })}
      >
        <Wrapper>
          <nav className="navbar-expand-lg relative mt-10 flex flex-wrap items-center justify-between md:mt-0">
            <Link href="/">
              <img
                alt="Marxan logo"
                src={theme === 'light' ? LOGO_BLACK_SVG : LOGO_SVG}
                style={SIZE[size].logo}
              />
            </Link>

            {!published && <Title />}

            {!maintenance && (
              <>
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

                  <div className="flex h-full items-center pl-1 md:pl-5">
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
              </>
            )}
          </nav>
        </Wrapper>
      </header>
    </>
  );
};

export default Header;
