import React, { useEffect, useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import cx from 'classnames';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { usePreGapAnalysis } from 'hooks/gap-analysis';
import useBottomScrollListener from 'hooks/scroll';

import Item from 'components/gap-analysis/item';
import Loading from 'components/loading';

export interface ScenariosPreGapAnalysisListProps {
  search?: string;
}

export const ScenariosPreGapAnalysisList: React.FC<ScenariosPreGapAnalysisListProps> = ({
  search,
}: ScenariosPreGapAnalysisListProps) => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setPreHighlightFeatures } = scenarioSlice.actions;
  const dispatch = useDispatch();
  const { preHighlightFeatures } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const {
    data: allFeaturesData,
    fetchNextPage: allFeaturesfetchNextPage,
    hasNextPage,
    isFetching: allFeaturesIsFetching,
    isFetchingNextPage: allFeaturesIsFetchingNextPage,
    isFetched: allFeaturesIsFetched,
  } = usePreGapAnalysis(sid, {
    search,
  });

  const scrollRef = useBottomScrollListener(() => {
    if (hasNextPage) allFeaturesfetchNextPage();
  });

  const toggleHighlight = useCallback(
    (id) => {
      const newHighlightFeatures = [...preHighlightFeatures];
      if (!newHighlightFeatures.includes(id)) {
        newHighlightFeatures.push(id);
      } else {
        const i = newHighlightFeatures.indexOf(id);
        newHighlightFeatures.splice(i, 1);
      }
      dispatch(setPreHighlightFeatures(newHighlightFeatures));
    },
    [dispatch, setPreHighlightFeatures, preHighlightFeatures]
  );

  const isHighlighted = useCallback(
    (id) => {
      if (!preHighlightFeatures.includes(id)) {
        return false;
      }
      return true;
    },
    [preHighlightFeatures]
  );

  useEffect(() => {
    return () => {
      dispatch(setPreHighlightFeatures([]));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex flex-grow flex-col overflow-hidden" style={{ minHeight: 200 }}>
      <div className="absolute -top-1 left-0 z-10 h-6 w-full bg-gradient-to-b from-gray-700 via-gray-700" />

      <div
        ref={scrollRef}
        className={cx({
          'divide-y divide-dashed divide-black divide-opacity-20 overflow-y-auto overflow-x-hidden bg-gray-700':
            true,
        })}
      >
        {allFeaturesIsFetching && !allFeaturesIsFetched && (
          <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center bg-gray-700 bg-opacity-90">
            <Loading
              visible
              className="z-40 flex w-full items-center justify-center "
              iconClassName="w-10 h-5 text-primary-500"
            />
            <div className="mt-5 font-heading text-xs uppercase">Loading Gap Analysis</div>
          </div>
        )}

        <div className="py-6">
          {!allFeaturesIsFetching && (!allFeaturesData || !allFeaturesData.length) && (
            <div className="flex h-40 w-full items-center justify-center text-sm uppercase">
              No results found
            </div>
          )}

          {allFeaturesData &&
            allFeaturesData.map((item, i) => {
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
                    highlighted={isHighlighted(item.id)}
                    onHighlight={() => toggleHighlight(item.id)}
                  />
                </div>
              );
            })}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-6 w-full bg-gradient-to-t from-gray-700 via-gray-700" />

      <div
        className={cx({
          'opacity-100': allFeaturesIsFetchingNextPage,
          'pointer-events-none absolute bottom-0 left-0 z-20 w-full text-center font-heading text-xs uppercase opacity-0 transition':
            true,
        })}
      >
        <div className="bg-gray-700 py-1">Loading more...</div>
        <div className="h-6 w-full bg-gray-700" />
      </div>
    </div>
  );
};

export default ScenariosPreGapAnalysisList;
