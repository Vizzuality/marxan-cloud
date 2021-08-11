import React, { useState, useCallback } from 'react';

import { motion } from 'framer-motion';

import List from 'layout/scenarios/edit/analysis/gap-analysis/list';
import Toolbar from 'layout/scenarios/edit/analysis/gap-analysis/toolbar';

import Button from 'components/button';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';

// Icons
import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

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
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex items-center pt-5 pb-1">
        <button
          type="button"
          className="flex items-center w-full mr-2 space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_RIGHT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading">GAP ANALYSIS</h4>
        </button>
        <InfoButton
          theme="primary"
        >
          <div>
            <h4 className="font-heading text-lg mb-2.5">What is the Solutions Gap Analysis?</h4>
            <div className="space-y-2 text-sm opacity-100">
              <p>
                Before running Marxan you were able to see
                the percentage of each feature that was currently
                inside your conservation network in
                {' '}
                <b>Gap Analysis</b>
              </p>
              <p>
                In this Gap analysis, you add to that
                previous network all the planning units that have been
                selected by Marxan,
                so this new percentage shows the amount of each feature that
                would be included if the new conservation plan your
                are working on is
                implemented.
              </p>

            </div>
          </div>
        </InfoButton>
        <Button
          theme="secondary"
          size="xs"
          className="ml-6"
          onClick={() => console.info('Download - Gap Analysis')}
        >
          Download
        </Button>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-hidden text-sm">
        <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-hidden">
          <Toolbar search={search} onSearch={onSearch} />
          <List
            search={search}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ScenariosSolutionsGapAnalysis;
