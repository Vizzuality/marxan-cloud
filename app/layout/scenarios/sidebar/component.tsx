import React, { ReactNode } from 'react';
import cx from 'classnames';

import Breadcrumb from 'components/breadcrumb';
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

      <div className="flex-grow mt-2.5">
        {children}
      </div>
    </div>
  );
};

export default ScenariosSidebar;
