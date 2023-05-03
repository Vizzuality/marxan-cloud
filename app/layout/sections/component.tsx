import React from 'react';

import cx from 'classnames';

import { motion } from 'framer-motion';

import Item from './item';

export interface ScenariosSidebarAnalysisSectionsProps {
  sections: {
    id: string;
    name: string;
    description: string;
  }[];
  onChangeSection: (s: string) => void;
  scrollable?: boolean;
}

export const ScenariosSidebarAnalysisSections: React.FC<ScenariosSidebarAnalysisSectionsProps> = ({
  sections,
  onChangeSection,
  scrollable = true,
}: ScenariosSidebarAnalysisSectionsProps) => {
  return (
    <motion.div
      key="analysis"
      className={cx({
        'relative ': true,
        'flex min-h-0 flex-col items-start justify-start overflow-hidden': scrollable,
      })}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {scrollable && (
        <div className="absolute left-0 top-0 z-10 h-6 w-full bg-gradient-to-b from-gray-700 via-gray-700" />
      )}
      <div
        className={cx({
          'divide-y divide-gray-600 divide-opacity-50': true,
          'overflow-y-auto overflow-x-hidden': scrollable,
        })}
      >
        {sections.map((s) => (
          <Item key={s.id} {...s} onChangeSection={onChangeSection} />
        ))}
      </div>
      {scrollable && (
        <div className="absolute bottom-0 left-0 z-10 h-6 w-full bg-gradient-to-t from-gray-700 via-gray-700" />
      )}
    </motion.div>
  );
};

export default ScenariosSidebarAnalysisSections;
