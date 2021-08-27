import React from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioSlice } from 'store/slices/scenarios/detail';

import cx from 'classnames';

import { usePostGapAnalysis } from 'hooks/gap-analysis';
import useBottomScrollListener from 'hooks/scroll';
import { useBestSolution } from 'hooks/solutions';

import Item from 'components/gap-analysis/item';
import Loading from 'components/loading';

export interface ScenariosPostGapAnalysisListProps {
  search?: string;
}

export const ScenariosPostGapAnalysisList: React.FC<ScenariosPostGapAnalysisListProps> = ({
  search,
}: ScenariosPostGapAnalysisListProps) => {
  const { query } = useRouter();
  const { sid } = query;

  getScenarioSlice(sid);

  const { selectedSolution } = useSelector((state) => state[`/scenarios/${sid}`]);

  const {
    data: bestSolutionData,
  } = useBestSolution(sid);

  const {
    data: allFeaturesData,
    fetchNextPage: allFeaturesfetchNextPage,
    hasNextPage,
    isFetching: allFeaturesIsFetching,
    isFetchingNextPage: allFeaturesIsFetchingNextPage,
    isFetched: allFeaturesIsFetched,
  } = usePostGapAnalysis(sid, {
    search,
    filters: {
      runId: selectedSolution?.runId || bestSolutionData?.runId,
    },
  });

  const scrollRef = useBottomScrollListener(
    () => {
      if (hasNextPage) allFeaturesfetchNextPage();
    },
  );

  return (
    <div className="relative flex flex-col flex-grow overflow-hidden" style={{ minHeight: 200 }}>
      <div className="absolute left-0 z-10 w-full h-6 -top-1 bg-gradient-to-b from-gray-700 via-gray-700" />

      <div
        ref={scrollRef}
        className={cx({
          'bg-gray-700 divide-y divide-black divide-dashed divide-opacity-20 overflow-y-auto overflow-x-hidden': true,
        })}
      >
        {(allFeaturesIsFetching && !allFeaturesIsFetched) && (
          <div className="absolute top-0 left-0 z-10 flex flex-col items-center justify-center w-full h-full bg-gray-700 bg-opacity-90">
            <Loading
              visible
              className="z-40 flex items-center justify-center w-full "
              iconClassName="w-10 h-10 text-primary-500"
            />
            <div className="mt-5 text-xs uppercase font-heading">Loading Gap Analysis</div>
          </div>
        )}

        <div className="py-6">
          {(!allFeaturesIsFetching && (!allFeaturesData || !allFeaturesData.length)) && (
            <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
              No results found
            </div>
          )}

          {allFeaturesData && allFeaturesData.map((item, i) => {
            return (
              <div
                key={`${item.id}`}
                className={cx({
                  'border-t border-dashed': i !== 0,
                })}
              >
                <Item
                  {...item}
                  scrollRoot={scrollRef}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-gray-700 via-gray-700" />

      <div
        className={cx({
          'opacity-100': allFeaturesIsFetchingNextPage,
          'absolute left-0 z-20 w-full text-xs text-center uppercase bottom-0 font-heading transition opacity-0 pointer-events-none': true,
        })}
      >
        <div className="py-1 bg-gray-700">Loading more...</div>
        <div className="w-full h-6 bg-gray-700" />
      </div>
    </div>
  );
};

export default ScenariosPostGapAnalysisList;
