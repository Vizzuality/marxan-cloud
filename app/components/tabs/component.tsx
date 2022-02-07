import React from 'react';

import cx from 'classnames';
import { motion } from 'framer-motion';

export interface TabsProps {
  items: {
    id: number | string;
    name: string;
    status?: 'active' | 'disabled' | 'outdated';
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
}: TabsProps) => {
  return (
    <ul className="flex justify-between font-heading">
      {items.map((tab) => (
        <li key={tab.id}>
          <button
            aria-label="select-tab"
            type="button"
            disabled={tab.status === 'disabled'}
            className={cx(
              {
                'relative focus:outline-none text-white text-sm py-4': true,
                'text-opacity-50': tab.status !== 'disabled',
                'hover:text-opacity-75': tab.id !== selected && tab.status !== 'disabled',
                'text-opacity-100 text-white': tab.id === selected && tab.status !== 'disabled',
                'text-opacity-20 cursor-auto text-white': tab.status === 'disabled',
              },
            )}
            onClick={() => onSelected(tab.id)}
          >
            {tab.name}
            {tab.warning && (
              <div className="absolute w-2 h-2 bg-yellow-500 rounded-full top-3 -right-3" />
            )}

            {tab.id === selected && tab.status !== 'disabled' && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                className="absolute w-full h-0.5 bg-primary-500 top-0 left-0"
              />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Tabs;
