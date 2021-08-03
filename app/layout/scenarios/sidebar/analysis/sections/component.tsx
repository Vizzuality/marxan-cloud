import React from 'react';

import { motion } from 'framer-motion';

import Item from './item';

const SECTIONS = [
  {
    id: 'gap-analysis',
    name: 'Gap analysis',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit quis quisquam, reiciendis neque, facere perspiciatis.',
    readonly: false,
  },
  {
    id: 'cost-surface',
    name: 'Cost surface',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit quis quisquam, reiciendis neque, facere perspiciatis.',
    readonly: false,
  },
  {
    id: 'adjust-planning-units',
    name: 'Adjust planning units (optional)',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit quis quisquam, reiciendis neque, facere perspiciatis.',
    readonly: false,
  },
];
export interface ScenariosSidebarAnalysisSectionsProps {
  readOnly: boolean,
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarAnalysisSections: React.FC<ScenariosSidebarAnalysisSectionsProps> = ({
  readOnly,
  onChangeSection,
}: ScenariosSidebarAnalysisSectionsProps) => {
  const readOnlySection = SECTIONS.find((s) => s.id === 'adjust-planning-units');
  if (readOnly) readOnlySection.readonly = true;

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
