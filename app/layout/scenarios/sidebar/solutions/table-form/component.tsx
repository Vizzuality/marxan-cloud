import React, { useState } from 'react';
import { useRouter } from 'next/router';

import { Button } from 'components/button/component';
import Checkbox from 'components/forms/checkbox';
import Icon from 'components/icon';
import Label from 'components/forms/label';
import LoadingMore from 'components/loading-more/component';
import Loading from 'components/loading';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

import { useSolutions } from 'hooks/solutions';
import useBottomScrollListener from 'hooks/scroll';

import InfoButton from 'components/info-button';
import SolutionsTable from '../table';

import { SolutionsTableFormProps } from './types';

export const SolutionsTableForm: React.FC<SolutionsTableFormProps> = ({
  onCancel,
  onSave,
}: SolutionsTableFormProps) => {
  const [mostDifSolutions, setMostDifSolutions] = useState<boolean>(false);
  const { query } = useRouter();
  const { pid } = query;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isFetched,
  } = useSolutions(pid, { filters: { 'most-different': mostDifSolutions } });

  const scrollRef = useBottomScrollListener(
    () => {
      if (hasNextPage) fetchNextPage();
    },
  );

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
            onChange={(event) => setMostDifSolutions(event.target.checked)}
          />
          <Label className="mx-2 text-gray-700">
            View 5 most different solutions
          </Label>
          <InfoButton
            theme="secondary"
          >
            <div>Info about 5 most different solutions</div>
          </InfoButton>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="relative overflow-x-hidden overflow-y-auto"
        style={{ height: '400px' }}
      >
        {(isFetching && !isFetched) && (
          <div className="absolute top-0 left-0 z-30 flex flex-col items-center justify-center w-full h-full">
            <Loading
              visible
              className="z-40 flex items-center justify-center w-full "
              iconClassName="w-5 h-5 text-primary-500"
            />
            <div className="mt-5 text-xs uppercase font-heading">Loading Solutions</div>
          </div>
        )}

        {(!isFetching && (!data || !data.length)) && (
          <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
            No results found
          </div>
        )}
        {(!isFetching || isFetchingNextPage) && data && data.length > 0 && (
          <SolutionsTable
            body={data}
            onSelectSolution={(solution) => console.info('solution selected', solution)}
          />
        )}
        <LoadingMore visible={isFetchingNextPage} />
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
