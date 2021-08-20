import React from 'react';

import { motion } from 'framer-motion';

import Item from './item';

export interface ScenariosSidebarAnalysisSectionsProps {
  sections: {
    id: string;
    name: string;
    description: string;
  }[];
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarAnalysisSections: React.FC<ScenariosSidebarAnalysisSectionsProps> = ({
  sections,
  onChangeSection,
}: ScenariosSidebarAnalysisSectionsProps) => {
  return (
    <motion.div
      key="analysis"
      className="relative flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute top-0 left-0 z-10 w-full h-6 bg-gradient-to-b from-gray-700 via-gray-700" />
      <div className="overflow-x-hidden overflow-y-auto divide-y divide-gray-600 divide-opacity-50">
        {sections.map((s) => (
          <Item
            key={s.id}
            {...s}
            onChangeSection={onChangeSection}
          />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 z-10 w-full h-6 bg-gradient-to-t from-gray-700 via-gray-700" />
    </motion.div>
  );
};

export default ScenariosSidebarAnalysisSections;
