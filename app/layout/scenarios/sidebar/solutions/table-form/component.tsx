import React from 'react';
import { useRouter } from 'next/router';

import { Button } from 'components/button/component';
import Checkbox from 'components/forms/checkbox';
import Icon from 'components/icon';
import Label from 'components/forms/label';
import Loading from 'components/loading';

import INFO_SVG from 'svgs/ui/info.svg?sprite';
import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

import { useSolutions } from 'hooks/solutions';

import SolutionsTable from '../table';
import { SolutionRow } from '../table/types';

import { SolutionsTableFormProps } from './types';

export const SolutionsTableForm: React.FC<SolutionsTableFormProps> = ({
  onCancel,
  onSave,
}: SolutionsTableFormProps) => {
  const { query } = useRouter();
  const { sid } = query;

  const { data, isFetching, isFetched } = useSolutions(sid);

  console.log('sid', sid, 'data', data, 'isFetching', isFetching, 'isFetched', isFetched);

  const body: SolutionRow[] = [
    {
      run: 1,
      score: 170,
      cost: 168,
      'view-on-map': false,
      best: false,
      id: 'row1',
      planningUnits: 168,
      missingValues: 2,
    },
    {
      run: 2,
      score: 150,
      cost: 48,
      'view-on-map': false,
      best: true,
      id: 'row2',
      planningUnits: 168,
      missingValues: 2,
    },
    {
      run: 3,
      score: 110,
      cost: 18,
      'view-on-map': false,
      best: false,
      id: 'row3',
      planningUnits: 168,
      missingValues: 2,
    },
    {
      run: 4,
      score: 140,
      cost: 188,
      'view-on-map': false,
      best: false,
      id: 'row4',
      planningUnits: 168,
      missingValues: 2,
    },
  ];

  return (
    <div className="text-gray-800">
      <div className="px-8 pb-8">
        <div className="flex items-center justify-start pb-6">
          <Button
            theme="secondary"
            size="base"
            className="flex items-center justify-between pl-4 pr-4"
            onClick={() => console.info('click - download solutions')}
          >
            Download solutions
            <Icon icon={DOWNLOAD_SVG} className="w-5 h-5 ml-8 text-white" />
          </Button>
        </div>
        <div className="flex items-center">
          <Checkbox
            theme="light"
            id="checkbox-5-dif-solutions"
            className="block w-4 h-4 text-green-300 form-checkbox-dark"
            onChange={() => console.info('click - 5 most different solutions')}
          />
          <Label className="ml-2 text-gray-700">
            View 5 most different solutions
          </Label>
          <button
            className="ml-3 bg-gray-500 rounded-full opacity-80 p-0.5"
            type="button"
          >
            <Icon icon={INFO_SVG} className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      <div className="relative">
        {isFetching && (
          <div className="absolute top-0 left-0 z-10 flex flex-col items-center justify-center w-full h-full bg-gray-100 bg-opacity-90">
            <Loading
              visible
              className="z-40 flex items-center justify-center w-full "
              iconClassName="w-5 h-5 text-primary-500"
            />
          </div>
        )}
        <SolutionsTable
          body={body}
          onSelectSolution={(solution) => console.info('solution selected', solution)}
        />
      </div>
      <div className="flex items-center justify-center w-full pt-8">
        <Button
          theme="secondary"
          size="lg"
          onClick={() => onCancel()}
        >
          Cancel
        </Button>
        <Button
          theme="primary"
          size="lg"
          onClick={() => onSave()}
          className="ml-4"
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default SolutionsTableForm;
