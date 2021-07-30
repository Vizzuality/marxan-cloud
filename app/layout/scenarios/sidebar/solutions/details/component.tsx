import React, { useState } from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { useSolution, useBestSolution } from 'hooks/solutions';

import { motion } from 'framer-motion';

import SolutionFrequency from 'layout/solutions/frequency';
import SolutionSelected from 'layout/solutions/selected';

import Button from 'components/button';
import Icon from 'components/icon';
import Loading from 'components/loading';
import Modal from 'components/modal';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';
import CLOCK_SVG from 'svgs/ui/clock.svg?sprite';
import TABLE_SVG from 'svgs/ui/table.svg?sprite';

import SolutionsTableForm from '../table-form/component';

import { ScenariosSolutionsDetailsProps } from './types';

export const ScenariosSolutionsDetails: React.FC<ScenariosSolutionsDetailsProps> = ({
  onChangeSection,
  onScheduleScenario,
  numberOfSchedules,
}: ScenariosSolutionsDetailsProps) => {
  const { query } = useRouter();
  const { sid } = query;
  const [showTable, setShowTable] = useState<boolean>(false);
  const [selectedSolutionOnMap, onToggleSelectedSolutionOnMap] = useState<boolean>(false);
  const [frequencyOnMap, onToggleFrequencyOnMap] = useState<boolean>(false);

  const { selectedSolutionId } = useSelector((state) => state['/solutions/details']);

  const {
    data: selectedSolutionData,
    isFetching: selectedSolutionisFetching,
    isFetched: selectedSolutionisFetched,
  } = useSolution(sid, selectedSolutionId);

  const {
    data: bestSolutionData,
    // isFetching: bestSolutionisFetching,
    // isFetched: bestSolutionisFetched,
  } = useBestSolution(sid);

  const isBestSolutionShown = selectedSolutionId === bestSolutionData.id || !selectedSolutionId;

  const frequencyValues = [
    {
      color: '#0C2C32',
      value: '0',
    },
    {
      color: '#006D83',
      value: null,
    },
    {
      color: '#008B8C',
      value: null,
    },
    {
      color: '#0BC6C2',
      value: '10',
    }];

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
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading">Details</h4>
        </button>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-hidden text-sm">
        <p className="py-4 opacity-50">Description Lorem ipsum dolor sit amet, solutions consectetuer adipiscing elit.</p>
        <Button
          theme="primary"
          size="base"
          className="flex h-12 mb-4"
          onClick={() => setShowTable(true)}
        >
          View solutions table
          <Icon icon={TABLE_SVG} className="absolute w-4 h-4 right-8" />
        </Button>
        <Button
          theme="secondary"
          size="base"
          onClick={() => onScheduleScenario()}
          className="h-12"
        >
          <div className="flex flex-col justify-center">
            Schedule scenario
            {numberOfSchedules > 0 && (
              <span className="text-blue-400 text-xxs">
                {`${numberOfSchedules} schedule${numberOfSchedules > 1 ? 's' : ''}`}
              </span>
            )}
          </div>
          <Icon icon={CLOCK_SVG} className="absolute w-4 h-4 right-8" />
        </Button>
        <Modal
          open={showTable}
          title="Solutions table"
          size="wide"
          dismissable
          onDismiss={() => setShowTable(false)}
        >
          <SolutionsTableForm
            onCancel={() => setShowTable(false)}
            onSave={() => setShowTable(false)}
          />
        </Modal>
      </div>

      <div className="w-full p-6 mt-12 border-t border-gray-600">
        <SolutionFrequency
          values={frequencyValues}
          onToggleFrequencyOnMap={onToggleFrequencyOnMap}
          frequencyOnMap={frequencyOnMap}
        />
      </div>

      <div className="w-full p-6 border-t border-gray-600">
        <Loading
          visible={selectedSolutionisFetching && !selectedSolutionisFetched}
          className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
          iconClassName="w-10 h-10 text-primary-500"
        />
        {(selectedSolutionData || bestSolutionData) && (
          <SolutionSelected
            best={isBestSolutionShown}
            values={selectedSolutionData || bestSolutionData}
            onToggleSelectedSolutionOnMap={onToggleSelectedSolutionOnMap}
            selectedSolutionOnMap={selectedSolutionOnMap}
          />
        )}
      </div>
    </motion.div>
  );
};

export default ScenariosSolutionsDetails;
