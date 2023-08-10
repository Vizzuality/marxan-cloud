import React, { useCallback, useState } from 'react';

import { motion } from 'framer-motion';

import InfoButton from 'components/info-button';
import List from 'layout/scenarios/edit/features/gap-analysis/list';
import Toolbar from 'layout/scenarios/edit/features/gap-analysis/toolbar';
import Section from 'layout/section';

export const ScenariosGapAnalysis = (): JSX.Element => {
  const [search, setSearch] = useState(null);

  const onSearch = useCallback((s) => {
    setSearch(s);
  }, []);

  return (
    <motion.div
      key="gap-analysis"
      className=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Section>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-400">Grid Setup</span>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">GAP Analysis</h3>
            <InfoButton theme="primary" className="bg-gray-300">
              <>
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
              </>
            </InfoButton>
          </div>
        </div>

        <div className="relative mt-1 flex min-h-0 w-full flex-grow flex-col">
          <Toolbar search={search} onSearch={onSearch} />

          <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
            <List search={search} />
          </div>
        </div>
      </Section>
    </motion.div>
  );
};

export default ScenariosGapAnalysis;
