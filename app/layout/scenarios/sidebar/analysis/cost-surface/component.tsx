import React from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-left.svg?sprite';

export interface ScenariosSidebarAnalysisSectionsProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarAnalysisSections: React.FC<ScenariosSidebarAnalysisSectionsProps> = ({
  onChangeSection,
}: ScenariosSidebarAnalysisSectionsProps) => {
  return (
    <motion.div
      key="gap-analysis"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        className="flex items-center w-full py-5 space-x-1 text-left"
        onClick={() => {
          onChangeSection(null);
        }}
      >
        <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3" />
        <h4 className="text-xs uppercase font-heading">Cost surface</h4>
      </button>

      <div>
        Cost surface
      </div>
    </motion.div>
  );
};

export default ScenariosSidebarAnalysisSections;
