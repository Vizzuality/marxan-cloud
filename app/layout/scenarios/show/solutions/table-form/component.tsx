import React, { useCallback, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioSlice } from 'store/slices/scenarios/detail';

import useBottomScrollListener from 'hooks/scroll';
import { useSolutions, useBestSolution, useMostDifferentSolutions } from 'hooks/solutions';

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
  onCancel, setShowTable,
}: SolutionsTableFormProps) => {
  const [mostDifSolutions, setMostDifSolutions] = useState<boolean>(false);
  const { query } = useRouter();
  const { sid } = query;
  const dispatch = useDispatch();

  const scenarioSlice = getScenarioSlice(sid);
  const { setSelectedSolution } = scenarioSlice.actions;

  const {
    data: bestSolutionData,

  } = useBestSolution(sid);

  const { selectedSolutionId } = useSelector((state) => state[`/scenarios/${sid}`]);
  const [selectedSolution, onSelectSolution] = useState(selectedSolutionId || bestSolutionData?.id);

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
    setShowTable(false);
  }, [dispatch, selectedSolution, setSelectedSolution, setShowTable]);

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
          <InfoButton
            theme="secondary"

          >
            <div>
              <h4 className="font-heading text-lg mb-2.5">Solutions</h4>
              <div className="space-y-2">
                <p>
                  Each solution gives an alternative answer to your planning problem.
                  The result of each solution reflects whether a planning unit is
                  selected or not in the conservation network.
                </p>
                <p>
                  The table shows a summary of the most informative
                  variables for each solution including:
                </p>
                <ul className="pl-6 space-y-1 list-disc">
                  <li>
                    <b>Score:</b>
                    {' '}
                    the answer to Marxan&apos;s
                    mathematical objective function. Simply put
                    it is the sum of the three terms:
                    1) the sum of the costs of the selected
                    planning units; 2) the total perimeter
                    of the selected planning units; and 3)
                    the total penalty incurred if conservation
                    targets are not met.
                  </li>
                  <li>
                    <b>Cost:</b>
                    {' '}
                    the sum of the costs of the selected planning units
                  </li>
                  <li>
                    <b>Missing Values:</b>
                    {' '}
                    number of features that don&apos;t meet their target
                  </li>
                  <li>
                    <b>Planning Units:</b>
                    number of planning units selected
                  </li>
                </ul>
                <p>
                  When you click on &apos;View on map&apos; you will
                  see the distribution of the selected planning units on the map
                </p>
                <p>
                  <i>
                    The files are equivalent to the
                    output_xxxx.csv from the generic Marxan outputs.
                  </i>
                </p>
              </div>
            </div>
          </InfoButton>
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
            <div>
              <h4 className="font-heading text-lg mb-2.5">5 most different solutions</h4>
              <div className="space-y-2">
                <p>
                  Marxan calculates a range of possible good solutions,
                  instead of a unique solution.
                </p>
                <p>
                  It is useful to see
                  how much the solutions differ by assessing
                  the 5 most extreme cases. These are obtained by
                  creating a distance matrix of all solutions by
                  applying the Jaccard similarity index and
                  then by grouping the results in 5 clusters.
                  The solutions that are more similar to each
                  other will fall in the same cluster. Finally,
                  for each cluster, the solution with the lowest
                  score is used as the representative solution of the group.
                </p>
              </div>
            </div>
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
            bestSolutionId={bestSolutionData?.id}
            body={mostDifSolutionsIsSelected ? mostDifSolutionsData : data}
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
