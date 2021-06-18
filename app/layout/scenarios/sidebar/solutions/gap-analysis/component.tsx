import React, { useState, useCallback } from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';
import Button from 'components/button';
import List from 'layout/scenarios/sidebar/analysis/gap-analysis/list';
import Toolbar from 'layout/scenarios/sidebar/analysis/gap-analysis/toolbar';

// Icons
import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';
import INFO_SVG from 'svgs/ui/info.svg?sprite';

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
      <header>
        <button
          type="button"
          className="flex items-center w-full pt-5 pb-1 space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_RIGHT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading">GAP ANALYSIS</h4>
        </button>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-hidden text-sm">
        <div
          className="flex items-center"
        >
          <h5 className="mr-2 text-xs uppercase">RUN GAP ANALYSIS</h5>
          <button
            type="button"
            className="p-0.5 mr-4 bg-blue-500 rounded-full opacity-50"
            onClick={() => console.info('Info - Gap Analysis')}
          >
            <Icon icon={INFO_SVG} className="w-4 h-4 text-gray-700" />
          </button>
          <Button
            theme="secondary"
            size="xs"
            onClick={() => console.info('Download - Gap Analysis')}
          >
            Download
          </Button>
        </div>
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
