import React, { useCallback, useEffect } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { usePostGapAnalysis } from 'hooks/gap-analysis';
import { useScenario } from 'hooks/scenarios';
import { useBestSolution } from 'hooks/solutions';

import Item from 'components/gap-analysis/item';
import Loading from 'components/loading';
import NoResults from 'layout/project/sidebar/project/inventory-panel/components/no-results';
import { cn } from 'utils/cn';

export const TargetAchievementList = ({ search }: { search?: string }): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setPostHighlightFeatures, setLayerSettings } = scenarioSlice.actions;
  const dispatch = useAppDispatch();

  const { selectedSolution, postHighlightFeatures } = useAppSelector(
    (state) => state[`/scenarios/${sid}/edit`]
  );

  const { data: scenarioData } = useScenario(sid);

  const { data: bestSolutionData } = useBestSolution(sid, {
    enabled: scenarioData?.ranAtLeastOnce,
  });

  const {
    data: allFeaturesData,
    isFetching: allFeaturesIsFetching,
    isFetched: allFeaturesIsFetched,
  } = usePostGapAnalysis(sid, {
    search,
    filters: {
      runId: selectedSolution?.runId || bestSolutionData?.runId,
    },
  });

  const toggleHighlight = useCallback(
    (id) => {
      const newHighlightFeatures = [...postHighlightFeatures];
      if (!newHighlightFeatures.includes(id)) {
        newHighlightFeatures.push(id);
      } else {
        const i = newHighlightFeatures.indexOf(id);
        newHighlightFeatures.splice(i, 1);
      }
      dispatch(setPostHighlightFeatures(newHighlightFeatures));

      dispatch(
        setLayerSettings({
          id,
          settings: {
            visibility: true,
          },
        })
      );
    },
    [dispatch, setPostHighlightFeatures, setLayerSettings, postHighlightFeatures]
  );

  const isHighlighted = useCallback(
    (id) => {
      if (!postHighlightFeatures.includes(id)) {
        return false;
      }
      return true;
    },
    [postHighlightFeatures]
  );

  useEffect(() => {
    return () => {
      dispatch(setPostHighlightFeatures([]));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex flex-grow flex-col overflow-hidden" style={{ minHeight: 200 }}>
      <div className="absolute -top-1 left-0 z-10 h-6 w-full bg-gradient-to-b from-gray-800 via-gray-800" />

      <div
        className={cn({
          'divide-y divide-dashed divide-black divide-opacity-20 overflow-y-auto overflow-x-hidden bg-gray-800':
            true,
        })}
      >
        {allFeaturesIsFetching && !allFeaturesIsFetched && (
          <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center bg-gray-800 bg-opacity-90">
            <Loading
              visible
              className="z-40 flex w-full items-center justify-center "
              iconClassName="w-10 h-10 text-primary-500"
            />
            <div className="mt-5 font-heading text-xs uppercase">Loading Gap Analysis</div>
          </div>
        )}

        {!allFeaturesIsFetching && (!allFeaturesData || !allFeaturesData.length) && <NoResults />}
        {allFeaturesData.length > 0 && (
          <div className="py-6">
            {allFeaturesData.map((item, i) => {
              return (
                <div
                  key={`${item.id}`}
                  className={cn({
                    'border-t border-dashed': i !== 0,
                  })}
                >
                  <Item
                    {...item}
                    highlighted={isHighlighted(item.id)}
                    onHighlight={() => toggleHighlight(item.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-6 w-full bg-gradient-to-t from-gray-800 via-gray-800" />
    </div>
  );
};

export default TargetAchievementList;
