import React, { useCallback, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import useBottomScrollListener from 'hooks/scroll';
import { useSolutions, useMostDifferentSolutions } from 'hooks/solutions';

import { setSelectedSolution } from 'store/slices/solutions/details';

import { Button } from 'components/button/component';
import Checkbox from 'components/forms/checkbox';
import Label from 'components/forms/label';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import LoadingMore from 'components/loading-more/component';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

import SolutionsTable from '../table';

import { SolutionsTableFormProps } from './types';

export const SolutionsTableForm: React.FC<SolutionsTableFormProps> = ({
  bestSolutionId, onCancel,
}: SolutionsTableFormProps) => {
  const { selectedSolutionId } = useSelector((state) => state['/solutions/details']);
  const [mostDifSolutions, setMostDifSolutions] = useState<boolean>(false);
  const [selectedSolution, onSelectSolution] = useState(selectedSolutionId || bestSolutionId);
  const { query } = useRouter();
  const { sid } = query;
  const dispatch = useDispatch();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isFetched,
  } = useSolutions(sid);

  const {
    data: mostDifSolutionsData,
    isFetching: mostDifSolutionsisFetching,
    isFetched: mostDifSolutionsisFetched,
  } = useMostDifferentSolutions(sid);

  const allSolutionsFetched = (!isFetching || isFetchingNextPage)
  && data && data.length > 0 && !mostDifSolutions;

  const mostDifSolutionsIsSelected = mostDifSolutions
  && mostDifSolutionsData && mostDifSolutionsData.length > 0;

  const noSolutionResults = ((!isFetching && (!data || !data.length)) || (!mostDifSolutionsisFetched
    && (!mostDifSolutionsData || !mostDifSolutionsData.length)));

  const solutionsAreLoading = ((isFetching && !isFetched)
    || (mostDifSolutionsisFetching && !mostDifSolutionsisFetched));

  const scrollRef = useBottomScrollListener(
    () => {
      if (hasNextPage) fetchNextPage();
    },
  );

  const onSave = useCallback(() => {
    dispatch(setSelectedSolution(selectedSolution));
  }, [dispatch, selectedSolution]);

  return (
    <div className="text-gray-800">
      <div className="flex items-center px-8 pb-8 space-x-6">
        <div className="flex items-center justify-start">
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
          <Label className="mx-2 text-sm text-gray-700">
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
        {solutionsAreLoading && (
          <div className="absolute top-0 left-0 z-30 flex flex-col items-center justify-center w-full h-full">
            <Loading
              visible
              className="z-40 flex items-center justify-center w-full "
              iconClassName="w-5 h-5 text-primary-500"
            />
            <div className="mt-5 text-xs uppercase font-heading">Loading Solutions</div>
          </div>
        )}

        {noSolutionResults && (
          <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
            No results found
          </div>
        )}

        {(allSolutionsFetched || mostDifSolutionsIsSelected) && (
          <SolutionsTable
            bestSolutionId={bestSolutionId}
            body={mostDifSolutionsIsSelected ? mostDifSolutionsData.slice(0, 5) : data}
            selectedSolution={selectedSolution}
            onSelectSolution={(solution) => onSelectSolution(solution.id)}
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
