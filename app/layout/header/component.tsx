import React from 'react';
import cx from 'classnames';

import Link from 'next/link';

import Wrapper from 'layout/wrapper';

import Icon from 'components/icon';
import LOGO_SVG from 'svgs/logo.svg?sprite';

export interface HeaderProps {
  theme: 'primary' | 'home'
}

export const Header: React.FC<HeaderProps> = ({ theme }:HeaderProps) => {
  return (
    <header
      className={cx({
        'w-full': true,
        'bg-black': theme === 'primary',
      })}
    >
      <nav className="relative flex flex-wrap items-center justify-between py-1 bg-black navbar-expand-lg">
        <Wrapper>
          <div className="relative flex justify-between w-full lg:w-auto lg:static lg:block lg:justify-start">
            <Link
              href="/"
            >
              <a href="/">
                <Icon icon={LOGO_SVG} className="h-12 w-28" />
              </a>
            </Link>

            <button
              className="block py-1 text-xl leading-none bg-transparent border border-transparent border-solid rounded outline-none cursor-pointer lg:hidden focus:outline-none"
              type="button"
            >
              <span className="relative block w-6 h-px bg-white rounded-sm" />
              <span className="relative block w-6 h-px mt-1 bg-white rounded-sm" />
              <span className="relative block w-6 h-px mt-1 bg-white rounded-sm" />
            </button>
          </div>
        </Wrapper>
      </nav>
    </header>
  );
};

export default Header;
