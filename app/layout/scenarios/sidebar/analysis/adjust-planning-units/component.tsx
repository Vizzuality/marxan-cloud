import React, { useState } from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';
import InfoButton from 'components/info-button';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

import Tabs from './tabs';
import Buttons from './buttons';

export interface ScenariosSidebarAnalysisSectionsProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarAnalysisSections: React.FC<ScenariosSidebarAnalysisSectionsProps> = ({
  onChangeSection,
}: ScenariosSidebarAnalysisSectionsProps) => {
  const [type, setType] = useState('include');

  return (
    <motion.div
      key="gap-analysis"
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
          <h4 className="text-xs uppercase font-heading">Adjust planning units</h4>
        </button>
        <InfoButton>
          <div>
            <h4 className="font-heading text-lg mb-2.5">Locked-in and locked-out planning units</h4>
            <div>

              You can force Marxan to include or exclude some planning units from your analysis.

              <br />
              <br />
              Manually including or excluding individual planning units
              is useful when a real-world issue affects where new
              protected areas can be designated. For example, if
              you know that a particular planning unit contains a restricted
              military area and cannot be designated, then you could
              manually exclude that planning unit from the project.
              <br />
              <br />

              The areas selected to be included will be
              {' '}
              <b>locked in </b>
              to your conservation plan and will appear in all of the solutions.
              <br />
              <br />
              The areas selected to be excluded will be
              {' '}
              <b>locked out </b>
              of your conservation plan and will never appear in the solutions
            </div>

          </div>
        </InfoButton>
      </header>

      <Tabs
        type={type}
        onChange={(t) => setType(t)}
      />

      <div className="relative flex flex-col flex-grow w-full min-h-0 overflow-hidden">
        <div className="absolute top-0 left-0 z-10 w-full h-3 bg-gradient-to-b from-gray-700 via-gray-700" />
        <div className="relative px-0.5 overflow-x-visible overflow-y-auto">
          <div className="py-3">
            <Buttons
              type={type}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 z-10 w-full h-3 bg-gradient-to-t from-gray-700 via-gray-700" />
      </div>

    </motion.div>
  );
};

export default ScenariosSidebarAnalysisSections;
