import React, { ReactNode, useCallback, useState } from 'react';
import cx from 'classnames';

import Breadcrumb from 'components/breadcrumb';
import Tabs from 'components/tabs';

import Pill from 'layout/pill';

import { useRouter } from 'next/router';
import { useProject } from 'hooks/projects';

const TABS = [
  {
    id: 'protected-areas',
    name: 'Protected areas',
  },
  {
    id: 'features',
    name: 'Features',
  },
  {
    id: 'analysis',
    name: 'Analysis',
  },
  {
    id: 'Solutions',
    name: 'Solutions',
  },
];
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

  const [tab, setTab] = useState('protected-areas');

  const { id, name } = data;

  const onSelectedTab = useCallback((t) => {
    setTab(t);
  }, []);

  return (
    <div
      className={cx({
        'w-full h-full flex flex-col': true,
      })}
    >
      <Breadcrumb
        onClick={() => {
          push(`/projects/${id}`);
        }}
      >
        Back to project &quot;
        {name}
        &quot;
      </Breadcrumb>

      <div className="mt-2.5">
        <Pill>
          <Tabs
            items={TABS}
            selected={tab}
            onSelected={onSelectedTab}
          />
        </Pill>
      </div>

      <div className="flex-grow mt-2.5">
        {children}
      </div>
    </div>
  );
};

export default ScenariosSidebar;
