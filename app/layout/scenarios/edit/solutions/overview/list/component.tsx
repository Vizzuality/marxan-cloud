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
      className="flex min-h-0 flex-col items-start justify-start overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header>
        <button
          aria-label="return"
          type="button"
          className="flex w-full items-center space-x-2 pb-1 pt-5 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="h-3 w-3 rotate-180 transform text-primary-500" />
          <h4 className="font-heading text-xs uppercase">SOLUTIONS</h4>
        </button>
      </header>
    </motion.div>
  );
};

export default ScenariosSolutionsGapAnalysis;
