import React from 'react';

import { motion } from 'framer-motion';

import Button from 'components/button';
import Icon from 'components/icon';
import ComingSoon from 'layout/help/coming-soon';

// Icons
import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';
import CLOCK_SVG from 'svgs/ui/clock.svg?sprite';

export interface ScenariosSolutionsScheduleProps {
  onChangeSection: (s: string) => void;
  onScheduleScenario: () => void;
  numberOfSchedules: number;
}

export const ScenariosSolutionsSchedule: React.FC<ScenariosSolutionsScheduleProps> = ({
  onChangeSection,
  onScheduleScenario,
  numberOfSchedules,
}: ScenariosSolutionsScheduleProps) => {
  return (
    <motion.div
      key="details"
      className="flex min-h-0 flex-col items-start justify-start overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex items-center pb-1 pt-5">
        <button
          aria-label="return"
          type="button"
          className="mr-2 flex w-full items-center space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_RIGHT_SVG} className="h-3 w-3 rotate-180 transform text-primary-500" />
          <h4 className="font-heading text-xs uppercase text-primary-500">Schedule Scenario</h4>
        </button>
      </header>

      <div className="w-full py-4">
        <ComingSoon>
          <Button
            theme="secondary"
            size="base"
            className="h-12 w-full"
            onClick={() => onScheduleScenario()}
          >
            <div className="flex flex-col justify-center">
              Schedule scenario
              {numberOfSchedules > 0 && (
                <span className="text-xxs text-blue-400">
                  {`${numberOfSchedules} schedule${numberOfSchedules > 1 ? 's' : ''}`}
                </span>
              )}
            </div>
            <Icon icon={CLOCK_SVG} className="absolute right-8 h-4 w-4" />
          </Button>
        </ComingSoon>
      </div>
    </motion.div>
  );
};

export default ScenariosSolutionsSchedule;
