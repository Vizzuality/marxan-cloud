import React from 'react';
import cx from 'classnames';

import Link from 'next/link';

import Wrapper from 'layout/wrapper';
import User from 'layout/header/user';

import Icon from 'components/icon';
import Button from 'components/button';

import { useAuth } from 'hooks/authentication';

import LOGO_SVG from 'svgs/logo.svg?sprite';

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

  return (
    <header
      className="w-full row-auto"
    >
      <nav className="relative flex flex-wrap items-center justify-between py-1 bg-black navbar-expand-lg">
        <Wrapper>
          <div className="relative flex justify-between w-full">
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
          </div>
        </Wrapper>
      </nav>
    </header>
  );
};

export default Header;
