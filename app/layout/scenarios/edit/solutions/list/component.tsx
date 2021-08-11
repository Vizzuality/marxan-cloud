import React from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

import { ScenariosSolutionsListProps } from './types';

export const ScenariosSolutionsGapAnalysis: React.FC<ScenariosSolutionsListProps> = ({
  onChangeSection,
}: ScenariosSolutionsListProps) => {
  return (
    <motion.div
      key="details"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header>
        <button
          type="button"
          className="flex items-center w-full pt-5 pb-1 space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading">SOLUTIONS</h4>
        </button>
      </header>
    </motion.div>
  );
};

export default ScenariosSolutionsGapAnalysis;
