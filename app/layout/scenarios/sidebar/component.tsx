import React from 'react';
import cx from 'classnames';

export interface ScenariosSidebarProps {
}

export const ScenariosSidebar: React.FC<ScenariosSidebarProps> = () => {
  return (
    <div
      className={cx({
        'w-full h-full': true,
      })}
    >
      Sidebar
    </div>
  );
};

export default ScenariosSidebar;
