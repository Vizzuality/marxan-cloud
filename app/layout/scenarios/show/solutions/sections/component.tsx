import React from 'react';

import { motion } from 'framer-motion';

import { SECTIONS } from './constants';
import Item from './item';
import { ScenariosSidebarSolutionsSectionsProps } from './types';

export const ScenariosSidebarSolutionsSections:
React.FC<ScenariosSidebarSolutionsSectionsProps> = ({
  onChangeSection,
}: ScenariosSidebarSolutionsSectionsProps) => {
  return (
    <motion.div
      key="analysis"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden divide-y divide-gray-600 divide-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {SECTIONS.map((s) => (
        <Item
          key={s.id}
          {...s}
          onChangeSection={onChangeSection}
        />
      ))}
    </motion.div>
  );
};

export default ScenariosSidebarSolutionsSections;
