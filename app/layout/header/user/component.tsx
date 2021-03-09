import React, { useCallback } from 'react';

import Link from 'next/link';
import Icon from 'components/icon';
import Avatar from 'components/avatar';
import Tooltip from 'components/tooltip';

import { signOut, useSession } from 'next-auth/client';
import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';
import SIGN_OUT_SVG from 'svgs/ui/sign-out.svg?sprite';

export interface HeaderUserProps {
}

export const HeaderUser: React.FC<HeaderUserProps> = () => {
  const [session, loading] = useSession();

  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  // prevent show anything while session is loading
  if (!session && loading) return null;
  const { user: { displayName } } = session;

  return (
    <Tooltip
      trigger="click"
      placement="bottom-end"
      interactive
      content={(
        <div
          className="overflow-hidden text-sm text-gray-500 bg-white rounded-2xl"
          style={{
            minWidth: 200,
          }}
        >
          <header className="w-full px-8 py-4 bg-black bg-opacity-5">
            <h2 className="mb-1">{displayName}</h2>
            <Link href="/me">
              <a href="/me" className="text-gray-400">View my profile</a>
            </Link>
          </header>

          <nav className="w-full px-8 py-5">
            <ul className="flex flex-col gap-3">
              <li>Manage team</li>
              <li>Language</li>
              <li>Help page</li>
            </ul>
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full px-8 py-5 border-t border-gray-300"
          >
            <Icon icon={SIGN_OUT_SVG} className="w-5 h-5 mr-2 text-gray-500" />
            <span>Log out</span>
          </button>
        </div>
      )}
    >
      <button
        type="button"
        className="flex items-center justify-start focus:outline-none"
      >
        <Avatar className="text-sm text-white uppercase bg-primary-700">
          {displayName.slice(0, 2)}
        </Avatar>
        <Icon icon={ARROW_DOWN_SVG} className="w-2.5 h-2.5 text-white" />
      </button>
    </Tooltip>
  );
};

export default HeaderUser;
