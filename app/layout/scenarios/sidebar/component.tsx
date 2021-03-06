import React, { ReactNode } from 'react';
import cx from 'classnames';

import { AnimatePresence } from 'framer-motion';

import Breadcrumb from 'components/breadcrumb';

import Tabs from 'layout/scenarios/sidebar/tabs';

import { useRouter } from 'next/router';
import { useProject } from 'hooks/projects';

export interface ScenariosSidebarProps {
  children: ReactNode
}

export const ScenariosSidebar: React.FC<ScenariosSidebarProps> = ({
  children,
}:ScenariosSidebarProps) => {
  const { push } = useRouter();
  const { query } = useRouter();
  const { pid } = query;
  const { data = {} } = useProject(pid);

  const { id, name } = data;

  return (
    <div
      className={cx({
        'w-full overflow-hidden flex flex-col flex-grow': true,
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

      <div className="flex-grow flex flex-col mt-2.5 overflow-hidden">
        <AnimatePresence>
          {children}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScenariosSidebar;
