import React, { useCallback, useState } from 'react';

import Link from 'next/link';

import { signOut } from 'next-auth/client';

import { useMe } from 'hooks/me';

import Avatar from 'components/avatar';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';
import SIGN_OUT_SVG from 'svgs/ui/sign-out.svg?sprite';

export interface HeaderUserProps {
}

export const HeaderUser: React.FC<HeaderUserProps> = () => {
  const { user } = useMe();
  const [open, setOpen] = useState(false);

  const handleClick = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const handleClickOutside = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  if (!user) return null;

  const {
    email, displayName, avatarDataUrl, isAdmin,
  } = user;

  return (
    <Tooltip
      placement="bottom-end"
      interactive
      popup
      visible={open}
      onClickOutside={handleClickOutside}
      content={(
        <div
          className="overflow-hidden text-sm text-gray-500 bg-white shadow-md rounded-2xl"
          style={{
            minWidth: 200,
          }}
        >
          <header className="w-full px-8 py-4 bg-black bg-opacity-5">
            <h2 className="mb-1 font-medium text-black">{displayName || email}</h2>
            <Link href="/me">
              <a href="/me" className="text-gray-400 hover:underline">My profile</a>
            </Link>
          </header>

          <nav className="w-full px-8 py-5 space-y-5">
            <ul className="flex flex-col space-y-3">
              {isAdmin && (
                <li>
                  <Link href="/admin">
                    <a href="/admin" className="hover:underline">Admin</a>
                  </Link>
                </li>
              )}

              <li>
                <Link href="/projects">
                  <a href="/projects" className="hover:underline">Projects</a>
                </Link>
              </li>

              <li>
                Manage Team
              </li>
            </ul>

            <ul className="pt-5 space-y-1 border-t-2 border-gray-100">
              <li className="text-xs font-semibold text-gray-300 uppercase font-heading">
                Language
              </li>
              <li className="text-xs font-semibold text-gray-300 uppercase font-heading">
                Help page
              </li>
            </ul>
          </nav>

          <button
            aria-label="log-out"
            type="button"
            onClick={handleSignOut}
            className="flex w-full px-8 py-3 bg-primary-500 hover:underline focus:outline-none"
          >
            <Icon icon={SIGN_OUT_SVG} className="w-5 h-5 mr-2" />
            <span>Log out</span>
          </button>
        </div>
      )}
    >
      <button
        aria-label="open-menu"
        type="button"
        className="flex items-center justify-start space-x-1 focus:outline-none"
        onClick={handleClick}
      >
        <Avatar className="text-sm text-white uppercase bg-blue-700" bgImage={avatarDataUrl}>
          {!avatarDataUrl && (displayName || email).slice(0, 2)}
        </Avatar>
        <Icon icon={ARROW_DOWN_SVG} className="w-2.5 h-2.5" />
      </button>
    </Tooltip>
  );
};

export default HeaderUser;
