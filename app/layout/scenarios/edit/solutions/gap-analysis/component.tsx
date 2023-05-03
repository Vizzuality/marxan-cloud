import React, { useState, useCallback } from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';
import InfoButton from 'components/info-button';

// Icons
import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

import List from './list';
import Toolbar from './toolbar';
import { ScenariosSolutionsGapAnalysisProps } from './types';

export const ScenariosSolutionsGapAnalysis: React.FC<ScenariosSolutionsGapAnalysisProps> = ({
  onChangeSection,
}: ScenariosSolutionsGapAnalysisProps) => {
  const [search, setSearch] = useState(null);

  const onSearch = useCallback((s) => {
    setSearch(s);
  }, []);

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
          <h4 className="font-heading text-xs uppercase text-primary-500">Target Achievement</h4>
        </button>
        <InfoButton theme="primary">
          <div>
            <h4 className="mb-2.5 font-heading text-lg">
              What is the Solutions Target Achievement?
            </h4>
            <div className="space-y-2 text-sm opacity-100">
              <p>
                Before running Marxan you were able to see the percentage of each feature that was
                currently inside your conservation network in <b>Target Achievement</b>
              </p>
              <p>
                In this Target Achievement, you add to that previous network all the planning units
                that have been selected by Marxan, so this new percentage shows the amount of each
                feature that would be included if the new conservation plan your are working on is
                implemented.
              </p>
            </div>
          </div>
        </InfoButton>
        {/* <Button
          theme="secondary"
          size="xs"
          className="ml-6"
          onClick={() => console.info('Download - Target Achievement')}
        >
          Download
        </Button> */}
      </header>

      <div className="relative mt-1 flex min-h-0 w-full flex-grow flex-col overflow-hidden text-sm">
        <div className="relative mt-1 flex min-h-0 w-full flex-grow flex-col overflow-hidden">
          <Toolbar search={search} onSearch={onSearch} />
          <List search={search} />
        </div>
      </div>
    </motion.div>
  );
};

export default ScenariosSolutionsGapAnalysis;
