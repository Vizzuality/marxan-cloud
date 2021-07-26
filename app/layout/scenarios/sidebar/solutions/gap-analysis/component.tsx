import React, { useState, useCallback } from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';
import Button from 'components/button';
import List from 'layout/scenarios/sidebar/analysis/gap-analysis/list';
import Toolbar from 'layout/scenarios/sidebar/analysis/gap-analysis/toolbar';
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
          <div className="text-sm opacity-100">
            Evaluate the status in terms of protection of
            your features in the resulting conservation plan.
            The result will show the percentage of each
            feature inside the included protected areas
            plus the percentage inside the planning units
            selected by Marxan and will inform you of
            the protection situation regarding your targets.
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
