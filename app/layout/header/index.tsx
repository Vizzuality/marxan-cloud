import React from 'react';

import Link from 'next/link';

import { useMe } from 'hooks/me';

import LinkButton from 'components/button';
import { AnchorButtonProps } from 'components/button';
import Icon from 'components/icon';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import Title from 'layout/header/title';
import { MENU_ITEM_COMMON_CLASSES, ICON_COMMON_CLASSES } from 'layout/project/navigation/constants';
import UserMenu from 'layout/project/navigation/user-menu';
import Wrapper from 'layout/wrapper';
import { cn } from 'utils/cn';

import LOGO_BLACK_SVG from 'svgs/logo-black.svg';
import LOGO_SVG from 'svgs/logo.svg';
import MENU_SVG from 'svgs/navigation/menu.svg?sprite';

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
  const { data: user } = useMe();

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
                {user ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className={MENU_ITEM_COMMON_CLASSES}>
                        <Icon
                          className={cn({
                            [ICON_COMMON_CLASSES]: true,
                            'h-6 w-6': true,
                            'text-white group-hover:text-gray-300': (
                              ['dark', 'transparent'] as HeaderProps['theme'][]
                            ).includes(theme),
                            'group-hover:text-gray-300': theme === 'light',
                          })}
                          icon={MENU_SVG}
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="left"
                      className="min-w-[410px] rounded-b-4xl rounded-tl-xl rounded-tr-4xl bg-white p-4"
                      collisionPadding={48}
                    >
                      <UserMenu />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div
                    className="flex items-center space-x-4"
                    style={{
                      height: SIZE[size].logo.height + 10,
                    }}
                  >
                    <LinkButton
                      href="/auth/sign-in"
                      theme={
                        cn({
                          clear: theme === 'light',
                          'secondary-alt': theme !== 'light',
                        }) as AnchorButtonProps['theme']
                      }
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
