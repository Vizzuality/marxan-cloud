import React, { useCallback, useState } from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import List from 'layout/scenarios/edit/features/gap-analysis/list';
import Toolbar from 'layout/scenarios/edit/features/gap-analysis/toolbar';

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
      className="flex min-h-0 flex-col items-start justify-start overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex items-center space-x-3 pb-1 pt-5">
        <button
          aria-label="return"
          type="button"
          className="flex w-full items-center space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="h-3 w-3 rotate-180 transform text-primary-500" />
          <h4 className="font-heading text-xs uppercase text-primary-500">Gap analysis</h4>
          <div className="mb-3 flex items-center space-x-2" />
        </button>

        <InfoButton>
          <div>
            <h4 className="mb-2.5 font-heading text-lg">What is a Gap Analysis?</h4>
            <div className="space-y-2">
              <p>
                The term &apos;gap&apos; refers to the difference between what is already under
                conservation and how much is still missing.
              </p>
              <p>
                The result shows the percentage of each feature that is currently inside your
                selected conservation network (the conservation areas you added in{' '}
                <b>Protected Areas</b>) and will inform you of the amount of conservation action
                still needed to achieve your targets.
              </p>

              <p>
                The Gap Analysis can be useful to adjust your targets in <b>Features</b>
              </p>

              <p>
                If no conservation areas were added to the plan, the Gap Analysis will show the
                current protection as 0%.
              </p>
            </div>
          </div>
        </InfoButton>
      </header>

      <div className="relative mt-1 flex min-h-0 w-full flex-grow flex-col overflow-hidden">
        <Toolbar search={search} onSearch={onSearch} />

        <List search={search} />
      </div>
    </motion.div>
  );
};

export default ScenariosGapAnalysis;
