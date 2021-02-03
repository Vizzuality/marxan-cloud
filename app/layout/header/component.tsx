import React from 'react';
import cx from 'classnames';

import Link from 'next/link';

import Wrapper from 'layout/wrapper';

import Icon from 'components/icon';
import Button from 'components/button';
import Avatar from 'components/avatar';

import LOGO_SVG from 'svgs/logo.svg?sprite';
import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';

export interface HeaderProps {
  size: 'base' | 'lg',
  user?: Record <string, unknown> // As soon as he define the User we must define this type better
}

const SIZE = {
  base: {
    logo: 'h-12 w-28',
  },
  lg: {
    logo: 'h-20 w-36',
  },
};

export const Header: React.FC<HeaderProps> = ({ size, user }:HeaderProps) => {
  return (
    <header
      className="w-full"
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

            {user?.isLogged && (
              <button
                type="button"
                className="flex items-center justify-start"
              >
                <Avatar className="text-sm text-white uppercase bg-primary-700">
                  MB
                </Avatar>
                <Icon icon={ARROW_DOWN_SVG} className="w-2.5 h-2.5 text-white" />
              </button>
            )}

            {!user?.isLogged && (
              <div className="flex items-center gap-4">
                <Button theme="secondary-alt" size="s" className="">
                  Sign in
                </Button>

                <Button theme="primary" size="s" className="">
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </Wrapper>
      </nav>
    </header>
  );
};

export default Header;
