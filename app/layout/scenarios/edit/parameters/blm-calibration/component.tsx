import React from 'react';

import { motion } from 'framer-motion';

import BlmCalibrationForm from 'layout/scenarios/edit/parameters/blm-calibration/blm-calibration-form';
import BlmForm from 'layout/scenarios/edit/parameters/blm-calibration/blm-form';

import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosBLMCalibrationProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosBLMCalibration: React.FC<ScenariosBLMCalibrationProps> = ({
  onChangeSection,
}: ScenariosBLMCalibrationProps) => {
  const minBlmValue = 0;
  const maxBlmValue = 10000000;

  return (
    <motion.div
      key="blm-calibration"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex items-center pt-5 pb-1 space-x-3">
        <button
          type="button"
          className="flex items-center w-full space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading text-primary-500">BLM Calibration</h4>
        </button>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-x-hidden overflow-y-auto">
        <BlmCalibrationForm />

        <BlmForm
          maxBlmValue={maxBlmValue}
          minBlmValue={minBlmValue}
        />
      </div>
    </motion.div>
  );
};

export default ScenariosBLMCalibration;
