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

import COMMUNITY_SVG from 'svgs/navigation/community.svg?sprite';
import DOCUMENTATION_SVG from 'svgs/navigation/documentation.svg?sprite';
import HELP_GUIDE_SVG from 'svgs/navigation/help-guide.svg?sprite';
import EDIT_PROFILE_SVG from 'svgs/navigation/pencil.svg?sprite';
import PROJECT_DASHBOARD_SVG from 'svgs/navigation/project-dashboard.svg?sprite';
import SIGN_OUT_SVG from 'svgs/ui/sign-out.svg?sprite';

import {
  ITEM_COMMON_CLASSES,
  ITEM_TITLE_COMMON_CLASSES,
  ITEM_DESCRIPTION_COMMON_CLASSES,
} from './constants';

const BUTTON_CLASSES = 'flex items-center space-x-2 rounded-xl text-gray-500 hover:text-white';

export const UserMenu = (): JSX.Element => {
  const { data: session } = useSession();
  const { data: user } = useMe();
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
    <div className="flex flex-col divide-y divide-gray-100 text-gray-500">
      <div className="mb-3 flex space-x-4">
        <div>
          <Avatar
            bgImage={user.avatarDataUrl}
            {...(!user.avatarDataUrl && { bgColor: COLOR_ME })}
            className="border-transparent"
          >
            {!user.avatarDataUrl && user.displayName.slice(0, 2).toUpperCase()}
          </Avatar>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="">
            <h2>{user.displayName}</h2>
            <h3 className="text-sm text-gray-400">{user.email}</h3>
          </div>
          <div className="flex space-x-2">
            <Button href="/me" theme="transparent-black" size="s" className={BUTTON_CLASSES}>
              <Icon icon={EDIT_PROFILE_SVG} className="h-5 w-5 transition-none" />
              <span>Edit profile</span>
            </Button>
            <Button
              theme="transparent-black"
              size="s"
              onClick={handleSignOut}
              className={BUTTON_CLASSES}
            >
              <Icon icon={SIGN_OUT_SVG} className="h-5 w-5 stroke-current transition-none" />
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
                'group items-start space-x-5 bg-transparent': true,
              })}
            >
              <div className="rounded-xl bg-gray-50 p-2 group-hover:bg-blue-400">
                <Icon icon={PROJECT_DASHBOARD_SVG} className="h-5 w-5 transition-none" />
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
          <li className={ITEM_COMMON_CLASSES}>
            <div className="flex w-full items-center justify-between">
              <div className="flex space-x-2">
                <div className="rounded-xl bg-white p-2 ">
                  <Icon icon={HELP_GUIDE_SVG} className="h-5 w-5" />
                </div>
                <h4 className={ITEM_TITLE_COMMON_CLASSES}>Help Guide</h4>
              </div>
              <Switch
                onCheckedChange={onToggleHelpGuide}
                className="bg-gray-500 data-[state=checked]:bg-blue-500"
                checked={active}
              />
            </div>
          </li>
          <li>
            <a
              href="https://marxansolutions.org/"
              target="_blank"
              rel="noreferrer noopener"
              className={cn({
                [ITEM_COMMON_CLASSES]: true,
                'flex items-center justify-start space-x-2': true,
              })}
            >
              <div className="rounded-xl bg-white p-2">
                <Icon icon={DOCUMENTATION_SVG} className="h-5 w-5" />
              </div>
              <h4
                className={cn({
                  [ITEM_TITLE_COMMON_CLASSES]: true,
                })}
              >
                Marxan Documentation
              </h4>
            </a>
          </li>
          <li>
            <Link
              href="/community/projects"
              className="flex items-center space-x-2 rounded-3xl bg-black/40 bg-[url('/images/bg-community-projects.png')] bg-right-bottom p-4 hover:bg-blend-darken"
            >
              <div className="rounded-xl bg-blue-400 p-2 text-white">
                <Icon icon={COMMUNITY_SVG} className="h-5 w-5" />
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
