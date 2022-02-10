import React from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';

// Icons
import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosSolutionsScheduleProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosSolutionsSchedule: React.FC<ScenariosSolutionsScheduleProps> = ({
  onChangeSection,
}: ScenariosSolutionsScheduleProps) => {
  return (
    <motion.div
      key="details"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex items-center pt-5 pb-1">
        <button
          aria-label="return"
          type="button"
          className="flex items-center w-full mr-2 space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_RIGHT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading text-primary-500">Gap analysis</h4>
        </button>
      </header>
    </motion.div>
  );
};

export default ScenariosSolutionsSchedule;
