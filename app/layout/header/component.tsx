import React from 'react';
import cx from 'classnames';

import Link from 'next/link';

import Wrapper from 'layout/wrapper';

import Icon from 'components/icon';
import Button from 'components/button';
import Avatar from 'components/avatar';

import { useMe } from 'hooks/users';
import { useTransition, animated, config } from 'react-spring';

import LOGO_SVG from 'svgs/logo.svg?sprite';
import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';

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
  const { user, isLoading } = useMe();

  const transitionConfig = {
    config: config.gentle,
    unique: true,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  };

  const isUserTransition = useTransition((user && !isLoading), null, transitionConfig);
  const isNotUserTransition = useTransition((!user && !isLoading), null, transitionConfig);

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

            {isUserTransition.map(({ item, key, props }) => item && (
              <animated.button
                key={key}
                type="button"
                style={props}
                className="flex items-center justify-start"
              >
                <Avatar className="text-sm text-white uppercase bg-primary-700">
                  MB
                </Avatar>
                <Icon icon={ARROW_DOWN_SVG} className="w-2.5 h-2.5 text-white" />
              </animated.button>
            ))}

            {isNotUserTransition.map(({ item, key, props }) => item && (
              <animated.div key={key} style={props} className="flex items-center gap-4">
                <Button theme="secondary-alt" size="s" className="">
                  Sign in
                </Button>

                <Button theme="primary" size="s" className="">
                  Sign up
                </Button>
              </animated.div>
            ))}
          </div>
        </Wrapper>
      </nav>
    </header>
  );
};

export default Header;
