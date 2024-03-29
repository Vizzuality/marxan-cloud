import React, { useState, useCallback, useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch } from 'store/hooks';
import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import InfoButton from 'components/info-button';
import { ScrollArea } from 'components/scroll-area';
import Section from 'layout/section';

import List from './list';
import Toolbar from './toolbar';

export const SolutionsTargetAchievements = (): JSX.Element => {
  const [search, setSearch] = useState<string>(null);
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const dispatch = useAppDispatch();
  const scenarioSlice = useMemo(() => getScenarioEditSlice(sid), [sid]);
  const { setLayerSettings } = scenarioSlice.actions;

  const onSearch = useCallback((s: typeof search) => {
    setSearch(s);
  }, []);

  useEffect(() => {
    dispatch(
      setLayerSettings({
        id: 'solution',
        settings: { visibility: true },
      })
    );
    dispatch(
      setLayerSettings({
        id: 'frequency',
        settings: { visibility: true },
      })
    );
  }, [dispatch, setLayerSettings]);

  return (
    <div className="relative flex flex-grow flex-col overflow-hidden">
      <motion.div
        key="details"
        className="flex flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Section className="flex w-full flex-col overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-500">Solutions</span>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium">Target Achievement</h3>
              <InfoButton theme="primary" className="bg-gray-400">
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
                      units that have been selected by Marxan, so this new percentage shows the
                      amount of each feature that would be included if the new conservation plan
                      your are working on is implemented.
                    </p>
                  </div>
                </div>
              </InfoButton>
            </div>
          </div>

          <div className="flex w-full flex-grow flex-col space-y-2 overflow-hidden">
            <Toolbar search={search} onSearch={onSearch} />
            <div className="relative flex h-full flex-grow flex-col overflow-hidden before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:h-6 before:w-full before:bg-gradient-to-b before:from-gray-800 before:via-gray-800 after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:z-10 after:h-6 after:w-full after:bg-gradient-to-t after:from-gray-800 after:via-gray-800">
              <ScrollArea className="h-full pr-3">
                <List search={search} />
              </ScrollArea>
            </div>
          </div>
        </Section>
      </motion.div>
    </div>
  );
};

export default SolutionsTargetAchievements;
