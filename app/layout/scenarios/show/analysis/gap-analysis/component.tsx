import React, { useCallback, useState } from 'react';

import { motion } from 'framer-motion';

import List from 'layout/scenarios/show/analysis/gap-analysis/list';
import Toolbar from 'layout/scenarios/show/analysis/gap-analysis/toolbar';

import Icon from 'components/icon';
import InfoButton from 'components/info-button';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

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
      <header className="flex items-center pt-5 pb-1 space-x-3">
        <button
          type="button"
          className="flex items-center w-full space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading">Gap analysis</h4>
          <div className="flex items-center mb-3 space-x-2" />
        </button>

        <InfoButton>
          <div>
            <h4 className="font-heading text-lg mb-2.5">What is a Gap Analysis?</h4>
            <div className="space-y-2">
              <p>
                The term &apos;gap&apos; refers to the difference between what
                is already under conservation and how much is still missing.
              </p>
              <p>
                The result
                shows the percentage of each feature that is currently
                inside your selected conservation network (the conservation
                areas you added in
                {' '}
                <b>Protected Areas</b>
                )
                {' '}
                and will inform you of the amount of conservation
                action still needed to achieve your targets.
              </p>

              <p>
                The Gap Analysis can be useful to adjust your targets in
                {' '}
                <b>Features</b>
              </p>

              <p>
                If no conservation areas were added to the plan,
                the Gap Analysis will show the current protection as 0%.
              </p>
            </div>

          </div>
        </InfoButton>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-hidden">
        <Toolbar search={search} onSearch={onSearch} />

        <List
          search={search}
        />
      </div>
    </motion.div>
  );
};

export default ScenariosGapAnalysis;
