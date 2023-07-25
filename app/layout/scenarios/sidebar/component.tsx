import React, { ReactNode } from 'react';

import cx from 'classnames';

import { useRouter } from 'next/router';

import { AnimatePresence } from 'framer-motion';

import { useProject } from 'hooks/projects';

import Breadcrumb from 'components/breadcrumb';
import Tabs from 'layout/scenarios/edit/tabs';

export interface ScenariosEditSidebarProps {
  children: ReactNode;
}

export const ScenariosEditSidebar: React.FC<ScenariosEditSidebarProps> = ({
  children,
}: ScenariosEditSidebarProps) => {
  const { push, query } = useRouter();
  const { pid } = query as { pid: string };

  const { data = {} } = useProject(pid);

  const { id, name } = data;

  return (
    <div
      className={cx({
        'flex w-full flex-grow flex-col overflow-hidden': true,
      })}
    >
      <Breadcrumb
        className="flex-shrink-0"
        onClick={() => {
          push(`/projects/${id}`);
        }}
      >
        Back to project &quot;
        {name}
        &quot;
      </Breadcrumb>

      <Tabs />

      <div className="mt-2.5 flex flex-grow flex-col overflow-hidden">
        <AnimatePresence>{children}</AnimatePresence>
      </div>
    </div>
  );
};

export default ScenariosEditSidebar;
