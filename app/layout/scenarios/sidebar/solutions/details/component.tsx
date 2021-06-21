import React, { useState } from 'react';

import { motion } from 'framer-motion';

import Icon from 'components/icon';
import Button from 'components/button';
import Modal from 'components/modal';
import Checkbox from 'components/forms/checkbox';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';
import CLOCK_SVG from 'svgs/ui/clock.svg?sprite';
import TABLE_SVG from 'svgs/ui/table.svg?sprite';
import INFO_SVG from 'svgs/ui/info.svg?sprite';

import Label from 'components/forms/label';
import { ScenariosSolutionsDetailsProps } from './types';
import SolutionsTable from '../table';

export const ScenariosSolutionsDetails: React.FC<ScenariosSolutionsDetailsProps> = ({
  onChangeSection,
  onScheduleScenario,
  numberOfSchedules,
}: ScenariosSolutionsDetailsProps) => {
  const [showTable, setShowTable] = useState<boolean>(false);

  const body = [
    {
      run: 1,
      score: 170,
      cost: 168,
      'view-on-map': false,
      best: false,
      id: 'row1',
    },
    {
      run: 2,
      score: 150,
      cost: 48,
      'view-on-map': false,
      best: false,
      id: 'row2',
    },
    {
      run: 3,
      score: 110,
      cost: 18,
      'view-on-map': false,
      best: true,
      id: 'row3',
    },
    {
      run: 4,
      score: 140,
      cost: 188,
      'view-on-map': false,
      best: false,
      id: 'row4',
    },
  ];

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
          size="default"
          dismissable
          onDismiss={() => setShowTable(false)}
          className="text-gray-800"
        >
          <div className="px-8 pb-8">
            <div className="flex items-center">
              <Checkbox
                theme="light"
                id="checkbox-5-dif-solutions"
                className="block w-4 h-4 mt-1.5 text-green-300 form-checkbox-dark"
                onChange={() => console.info('click - 5 most different solutions')}
              />
              <Label>
                View 5 most different solutions
              </Label>
              <Icon icon={INFO_SVG} />
            </div>
          </div>
          <SolutionsTable
            body={body}
          />
        </Modal>
      </div>
    </motion.div>
  );
};

export default ScenariosSolutionsDetails;
