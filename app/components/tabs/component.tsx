import React from 'react';
import cx from 'classnames';

export interface TabsProps {
  tabs: Array<{
    id: number;
    name: string;
    status: 'active' | 'disabled';
    warning: boolean;
    requirements: React.ReactNode;
  }>;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | unknown;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs = [],
  onClick,
}: TabsProps) => (
  <div className="flex flex-col px-8 bg-gray-700 border border-gray-700 rounded-3xl">
    <ul className="flex justify-between flex-grow py-3 font-heading">
      {tabs.map((tab) => (
        <li key={tab.id}>
          <button
            type="button"
            className={cx(
              'relative focus:outline-none text-white text-opacity-50 text-sm',
              { 'text-opacity-100': tab.status === 'active' },
            )}
            onClick={onClick}
          >
            {tab.name}
            {tab.warning && (
              <div className="absolute w-2 h-2 bg-red-500 rounded-full -top-0 -right-3" />
            )}
          </button>
        </li>
      ))}
    </ul>
    {tabs.some((tab) => !!tab.warning) && (
      <div
        aria-hidden="true"
        className="w-full h-px opacity-50 bg-gradient-to-r from-transparent via-gray-300 to-transparent"
      />
    )}
    {tabs.map(
      (tab) => tab.warning
        && tab.requirements && (
          <div key={tab.id} className="flex items-center py-3">
            {tab.requirements}
          </div>
      ),
    )}
  </div>
);

export default Tabs;
