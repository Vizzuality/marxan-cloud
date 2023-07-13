import { useCallback } from 'react';

import { useQuery } from 'react-query';

import Link from 'next/link';

import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import { usePlausible } from 'next-plausible';

import { useHelp } from 'hooks/help';
import { useMe } from 'hooks/me';
import { COLOR_ME } from 'hooks/project-users';

import Avatar from 'components/avatar';
import Button from 'components/button';
import { Switch } from 'components/forms/switch';
import Icon from 'components/icon';
import { cn } from 'utils/cn';

import HELP_GUIDE_SVG from 'svgs/navigation/help-guide.svg?sprite';
import EDIT_PROFILE_SVG from 'svgs/navigation/pencil.svg?sprite';
import DOCUMENTATION_SVG from 'svgs/ui/documentation.svg?sprite';
import SIGN_OUT_SVG from 'svgs/ui/sign-out.svg?sprite';

import {
  ITEM_COMMON_CLASSES,
  ITEM_TITLE_COMMON_CLASSES,
  ITEM_DESCRIPTION_COMMON_CLASSES,
} from './constants';

export const UserMenu = (): JSX.Element => {
  const { data: session } = useSession();
  const { user } = useMe();
  const { active, onActive } = useHelp();
  const plausible = usePlausible();

  const { data: totalProjects } = useQuery(['user-total-projects', user.id], {
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
        .then((response) => response.data),
    enabled: Boolean(session),
    select: ({ meta }) => meta.totalItems,
  });

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, []);

  const onToggleHelpGuide = useCallback(() => {
    onActive(!active);
    if (active) {
      plausible('Activate help guide', {
        props: {
          userId: `${user.id}`,
          userEmail: `${user.email}`,
        },
      });
    }
  }, [active, onActive, plausible, user.id, user.email]);

  return (
    <div className="flex flex-col divide-y divide-gray-200 text-gray-500">
      <div className="mb-3 flex space-x-2">
        <div>
          <Avatar
            bgImage={user.avatar}
            {...(!user.avatar && { bgColor: COLOR_ME })}
            className="border-transparent"
          >
            {!user.avatar && user.displayName.slice(0, 2).toUpperCase()}
          </Avatar>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="">
            <h2>{user.displayName}</h2>
            <h3 className="text-sm text-gray-400">{user.email}</h3>
          </div>
          <div className="flex space-x-2">
            <Button
              href="/me"
              theme="clear"
              size="s"
              className="flex items-center space-x-2 rounded-xl border border-gray-500"
            >
              <Icon icon={EDIT_PROFILE_SVG} className="h-5 w-5" />
              <span>Edit profile</span>
            </Button>
            <Button
              theme="clear"
              size="s"
              onClick={handleSignOut}
              className="flex items-center space-x-2 rounded-xl border border-gray-500"
            >
              <Icon icon={SIGN_OUT_SVG} className="h-5 w-5" />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      </div>
      <div>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/projects"
              className={cn({
                [ITEM_COMMON_CLASSES]: true,
                'items-start space-x-5 bg-transparent': true,
              })}
            >
              <div className="rounded-xl bg-gray-50 p-2">
                <Icon icon={EDIT_PROFILE_SVG} className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className={ITEM_TITLE_COMMON_CLASSES}>
                  <span>Projects dashboard</span>
                  <span className="block rounded-[4px] border border-blue-300 bg-blue-100 px-1 text-xs font-semibold">
                    {totalProjects}
                  </span>
                </h4>
                <span className={ITEM_DESCRIPTION_COMMON_CLASSES}>
                  Get a high-level summary of your projects and progress.
                </span>
              </div>
            </Link>
          </li>
          {/* <li>
            <Link
              href="/team"
              className={cn({
                [ITEM_COMMON_CLASSES]: true,
                'items-start space-x-5 bg-transparent': true,
              })}
            >
              <div className="rounded-xl bg-gray-50 p-2">
                <Icon icon={COMMUNITY_SVG} className="h-5 w-5" />
              </div>
              <div>
                <h4 className={ITEM_TITLE_COMMON_CLASSES}>Manage team</h4>
                <span className={ITEM_DESCRIPTION_COMMON_CLASSES}>
                  Lorem ipsum dolor sit amet augue fringilla consequat
                </span>
              </div>
            </Link>
          </li> */}
          <li className={ITEM_COMMON_CLASSES}>
            <div className="flex items-center space-x-2">
              <div className="rounded-xl bg-white p-2">
                <Icon icon={HELP_GUIDE_SVG} className="h-5 w-5" />
              </div>
              <span className={ITEM_TITLE_COMMON_CLASSES}>Help Guide</span>
            </div>
            <Switch onCheckedChange={onToggleHelpGuide} className="bg-gray-500" />
          </li>
          <li>
            <Link
              href="/community/projects"
              className="flex items-center space-x-2 rounded-3xl bg-[url('/images/bg-community-projects.png')] bg-right-bottom p-4"
            >
              <div className="rounded-xl bg-blue-400 p-2 text-white">
                <Icon icon={DOCUMENTATION_SVG} className="h-5 w-5" />
              </div>
              <h4
                className={cn({
                  [ITEM_TITLE_COMMON_CLASSES]: true,
                  'text-white': true,
                })}
              >
                Community projects
              </h4>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserMenu;
