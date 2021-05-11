import React, { useCallback, useState } from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

import Toolbar from 'layout/scenarios/sidebar/analysis/gap-analysis/toolbar';
import List from 'layout/scenarios/sidebar/analysis/gap-analysis/list';

export interface ScenariosGapAnalysisProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosGapAnalysis: React.FC<ScenariosGapAnalysisProps> = ({
  onChangeSection,
}: ScenariosGapAnalysisProps) => {
  const [search, setSearch] = useState(null);

  const onSearch = useCallback((s) => {
    setSearch(s);
  }, []);

  return (
    <motion.div
      key="gap-analysis"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="mb-5">
        <button
          type="button"
          className="flex items-center w-full pt-5 pb-1 space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading">Gap analysis</h4>
        </button>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 overflow-hidden">
        <Toolbar search={search} onSearch={onSearch} />

        <List
          search={search}
        />
      </div>
    </motion.div>
  );
};

export default ScenariosGapAnalysis;
