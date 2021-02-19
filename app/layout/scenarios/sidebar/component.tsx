import React from 'react';
import cx from 'classnames';

import SidebarName from 'layout/scenarios/sidebar/name';

export interface ScenariosSidebarProps {
}

export const ScenariosSidebar: React.FC<ScenariosSidebarProps> = () => {
  return (
    <div
      className={cx({
        'w-full h-full': true,
      })}
    >
      <SidebarName />
    </div>
  );
};

export default ScenariosSidebar;
