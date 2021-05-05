import React from 'react';

import { motion } from 'framer-motion';

export interface ScenariosSidebarAnalysisSectionsProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarAnalysisSections: React.FC<ScenariosSidebarAnalysisSectionsProps> = ({
  onChangeSection,
}: ScenariosSidebarAnalysisSectionsProps) => {
  return (
    <motion.div
      key="analysis"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        className="w-full py-5 pr-10 text-left"
        onClick={() => {
          onChangeSection('gap-analysis');
        }}
      >
        <h4 className="text-xs uppercase font-heading">Gap analysis</h4>
        <p className="mt-1 text-sm text-gray-300">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit quis quisquam, reiciendis neque, facere perspiciatis.</p>
      </button>

      <button
        type="button"
        className="w-full py-5 pr-10 text-left"
        onClick={() => {
          onChangeSection('cost-surface');
        }}
      >
        <h4 className="text-xs uppercase font-heading">Cost surface</h4>
        <p className="mt-1 text-sm text-gray-300">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit quis quisquam, reiciendis neque, facere perspiciatis.</p>
      </button>

      <button
        type="button"
        className="w-full py-5 pr-10 text-left"
        onClick={() => {
          onChangeSection('adjust-planning-units');
        }}
      >
        <h4 className="text-xs uppercase font-heading">Adjust planning units (optional)</h4>
        <p className="mt-1 text-sm text-gray-300">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit quis quisquam, reiciendis neque, facere perspiciatis.</p>
      </button>
    </motion.div>
  );
};

export default ScenariosSidebarAnalysisSections;
