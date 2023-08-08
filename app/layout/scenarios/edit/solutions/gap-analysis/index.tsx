import React, { useState, useCallback } from 'react';

import { motion } from 'framer-motion';

import InfoButton from 'components/info-button';

import List from './list';
import Toolbar from './toolbar';

export const ScenariosSolutionsGapAnalysis = (): JSX.Element => {
  const [search, setSearch] = useState(null);

  const onSearch = useCallback((s) => {
    setSearch(s);
  }, []);

  return (
    <div className="relative flex max-h-[85vh] min-h-0 flex-grow flex-col overflow-hidden">
      <div className="absolute left-0 top-0 z-10 h-6 w-full bg-gradient-to-b from-gray-700 via-gray-700" />
      <div className="flex  flex-grow flex-col overflow-y-auto overflow-x-hidden">
        <motion.div
          key="details"
          className="flex min-h-0 flex-col items-start justify-start overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <header className="flex items-center space-x-3 pb-1 pt-5">
            <h4 className="font-heading text-xs uppercase text-primary-500">Target Achievement</h4>

            <InfoButton theme="primary">
              <div>
                <h4 className="mb-2.5 font-heading text-lg">
                  What is the Solutions Target Achievement?
                </h4>
                <div className="space-y-2 text-sm opacity-100">
                  <p>
                    Before running Marxan you were able to see the percentage of each feature that
                    was currently inside your conservation network in <b>Target Achievement</b>
                  </p>
                  <p>
                    In this Target Achievement, you add to that previous network all the planning
                    units that have been selected by Marxan, so this new percentage shows the amount
                    of each feature that would be included if the new conservation plan your are
                    working on is implemented.
                  </p>
                </div>
              </div>
            </InfoButton>
          </header>

          <div className="relative mt-1 flex min-h-0 w-full flex-grow flex-col overflow-hidden text-sm">
            <div className="relative mt-1 flex min-h-0 w-full flex-grow flex-col overflow-hidden">
              <Toolbar search={search} onSearch={onSearch} />
              <List search={search} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScenariosSolutionsGapAnalysis;
