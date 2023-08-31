import React, { useCallback, useState } from 'react';

import { motion } from 'framer-motion';

import InfoButton from 'components/info-button';
import Section from 'layout/section';

import List from './list';
import Toolbar from './toolbar';

export const GridSetupGAPAnalysis = (): JSX.Element => {
  const [search, setSearch] = useState<string>(null);

  const onSearch = useCallback((s: string) => {
    setSearch(s);
  }, []);

  return (
    <motion.div
      key="gap-analysis"
      className="flex h-full flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Section className="flex flex-col overflow-hidden">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-400">Grid Setup</span>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Gap Analysis</h3>
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

        <Toolbar search={search} onSearch={onSearch} />

        <div className="max-h-full overflow-y-auto">
          <List search={search} />
        </div>
      </Section>
    </motion.div>
  );
};

export default GridSetupGAPAnalysis;
