import React, { useCallback, useState } from 'react';

import { motion } from 'framer-motion';

import InfoButton from 'components/info-button';
import { ScrollArea } from 'components/scroll-area';
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
      <Section className="flex flex-col space-y-2 overflow-hidden">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-400">Grid Setup</span>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Gap Analysis</h3>
            <InfoButton theme="primary" className="bg-gray-400">
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

        <div className="relative flex h-full flex-col overflow-hidden before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:h-6 before:w-full before:bg-gradient-to-b before:from-gray-800 before:via-gray-800 after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:z-10 after:h-6 after:w-full after:bg-gradient-to-t after:from-gray-800 after:via-gray-800">
          <ScrollArea className="h-full pr-3">
            <List search={search} />
          </ScrollArea>
        </div>
      </Section>
    </motion.div>
  );
};

export default GridSetupGAPAnalysis;
