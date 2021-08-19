import React from 'react';

import { motion } from 'framer-motion';

import Item from './item';

const SECTIONS = [
  {
    id: 'gap-analysis',
    name: 'Gap analysis',
    description: 'A gap analysis calculates how much of each feature is under the existing protected area network and then summarises the representation as a percentage',
  },
  {
    id: 'cost-surface',
    name: 'Cost surface',
    description: 'Costs reflect any variety of socioeconomic factors, which if minimized, might help the conservation plan be implemented more effectively and reduce conflicts with other uses. By default all projects have an equal area cost surface which means that planning units with the same area have the same cost ',
  },
  {
    id: 'adjust-planning-units',
    name: 'Adjust planning units (optional)',
    description: 'The status of a planning unit determines whether it is included in every solution (i.e. locked in) or excluded (i.e. locked out). The default status is neither included or excluded but determined during the Marxan analysis.',
  },
];
export interface ScenariosSidebarAnalysisSectionsProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarAnalysisSections: React.FC<ScenariosSidebarAnalysisSectionsProps> = ({
  onChangeSection,
}: ScenariosSidebarAnalysisSectionsProps) => {
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

export default ScenariosSidebarAnalysisSections;
