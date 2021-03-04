import React, { ReactNode } from 'react';
import cx from 'classnames';

export interface ScenariosSidebarProps {
  children: ReactNode
}

export const ScenariosSidebar: React.FC<ScenariosSidebarProps> = ({
  children,
}:ScenariosSidebarProps) => {
  return (
    <div
      className={cx({
        'w-full h-full': true,
      })}
    >
      {children}
    </div>
  );
};

export default ScenariosSidebar;
