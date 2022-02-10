import React from 'react';

import { motion } from 'framer-motion';

import ComingSoon from 'layout/help/coming-soon';

import Button from 'components/button';
import Icon from 'components/icon';

// Icons
import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';
import CLOCK_SVG from 'svgs/ui/clock.svg?sprite';

export interface ScenariosSolutionsScheduleProps {
  onChangeSection: (s: string) => void;
  onScheduleScenario: () => void;
  numberOfSchedules: number,
}

export const ScenariosSolutionsSchedule: React.FC<ScenariosSolutionsScheduleProps> = ({
  onChangeSection,
  onScheduleScenario,
  numberOfSchedules,
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
          <h4 className="text-xs uppercase font-heading text-primary-500">Schedule Scenario</h4>
        </button>
      </header>

      <div className="w-full py-4">
        <ComingSoon>
          <Button
            theme="secondary"
            size="base"
            className="w-full h-12"
            onClick={() => onScheduleScenario()}
          >
            <div className="flex flex-col justify-center">
              Schedule scenario
              {numberOfSchedules > 0 && (
                <span className="text-blue-400 text-xxs">
                  {`${numberOfSchedules} schedule${numberOfSchedules > 1 ? 's' : ''}`}
                </span>
              )}
            </div>
            <Icon icon={CLOCK_SVG} className="absolute w-4 h-4 right-8" />
          </Button>
        </ComingSoon>
      </div>

    </motion.div>
  );
};

export default ScenariosSolutionsSchedule;
