import React from 'react';
import cx from 'classnames';

export interface TabsProps {
  items: {
    id: number | string;
    name: string;
    status?: 'active' | 'disabled';
    warning?: boolean;
    requirements?: React.ReactNode;
  }[];
  selected: string | number;
  className?: string;
  onSelected?: (selected: string | number) => void | unknown;
}

export const Tabs: React.FC<TabsProps> = ({
  items = [],
  selected,
  onSelected,
}: TabsProps) => (
  <ul className="flex justify-between font-heading">
    {items.map((tab) => (
      <li key={tab.id}>
        <button
          type="button"
          className={cx(
            {
              'relative focus:outline-none text-white text-opacity-50 text-sm': true,
              'hover:text-opacity-75': tab.id !== selected,
              'text-opacity-100': tab.id === selected,
            },
          )}
          onClick={() => onSelected(tab.id)}
        >
          {tab.name}
          {tab.warning && (
            <div className="absolute w-2 h-2 bg-red-500 rounded-full -top-0 -right-3" />
          )}
        </button>
      </li>
    ))}
  </ul>
);

export default Tabs;
