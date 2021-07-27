import React, { useState, useCallback, useEffect } from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';

import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { getScenarioSlice } from 'store/slices/scenarios/edit';

import { useScenarioPU } from 'hooks/scenarios';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

import Tabs from './tabs';
import Buttons from './buttons';

export interface ScenariosSidebarAnalysisSectionsProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarAnalysisSections: React.FC<ScenariosSidebarAnalysisSectionsProps> = ({
  onChangeSection,
}: ScenariosSidebarAnalysisSectionsProps) => {
  const [type, setType] = useState('include');

  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioSlice(sid);
  const {
    setPUAction, setPuIncludedValue, setPuExcludedValue,
  } = scenarioSlice.actions;
  const dispatch = useDispatch();

  const { data: PUData } = useScenarioPU(sid);

  useEffect(() => {
    if (PUData) {
      const { included, excluded } = PUData;
      dispatch(setPuIncludedValue(included));
      dispatch(setPuExcludedValue(excluded));
    }
  }, [PUData]); //eslint-disable-line

  const onChangeTab = useCallback((t) => {
    setType(t);
    dispatch(setPUAction(t));
  }, [dispatch, setPUAction]);

  return (
    <motion.div
      key="gap-analysis"
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
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading">Adjust planning units</h4>
        </button>
      </header>

      <Tabs
        type={type}
        onChange={onChangeTab}
      />

      <div className="relative flex flex-col flex-grow w-full min-h-0 overflow-hidden">
        <div className="absolute top-0 left-0 z-10 w-full h-3 bg-gradient-to-b from-gray-700 via-gray-700" />
        <div className="relative px-0.5 overflow-x-visible overflow-y-auto">
          <div className="py-3">
            <Buttons
              type={type}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 z-10 w-full h-3 bg-gradient-to-t from-gray-700 via-gray-700" />
      </div>

    </motion.div>
  );
};

export default ScenariosSidebarAnalysisSections;
