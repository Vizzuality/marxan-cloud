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
  className,
  onClick,
}: TabsProps) => (
  <div className="flex flex-col px-4 bg-gray-700 rounded-3xl border border-gray-700">
    <ul
      className={cx('flex flex-grow justify-between py-3', {
        'border-b': tabs.find((t) => !!t.warning),
        [className]: !!className,
      })}
    >
      {tabs.map((tab) => (
        <li key={tab.id}>
          <button
            type="button"
            className={cx(
              'relative focus:outline-none text-primary-500 text-white text-opacity-50',
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
