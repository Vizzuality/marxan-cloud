import React, { useEffect, useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { usePreGapAnalysis } from 'hooks/gap-analysis';

import Item from 'components/gap-analysis/item';
import Loading from 'components/loading';
import NoResults from 'layout/project/sidebar/project/inventory-panel/components/no-results';
import { Feature } from 'types/api/feature';
import { cn } from 'utils/cn';

export interface ScenariosPreGapAnalysisListProps {
  search?: string;
}

export const ScenariosPreGapAnalysisList = ({ search }: { search?: string }) => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setPreHighlightFeatures, setLayerSettings } = scenarioSlice.actions;
  const dispatch = useDispatch();
  const { preHighlightFeatures, layerSettings } = useSelector(
    (state) => state[`/scenarios/${sid}/edit`]
  );

  const {
    data: allFeaturesData,
    isFetching: allFeaturesIsFetching,
    isFetched: allFeaturesIsFetched,
  } = usePreGapAnalysis(sid, {
    search,
  });

  const toggleHighlight = useCallback(
    (id: Feature['id']) => {
      const newHighlightFeatures = [...preHighlightFeatures];
      if (!newHighlightFeatures.includes(id)) {
        newHighlightFeatures.push(id);
      } else {
        const i = newHighlightFeatures.indexOf(id);
        newHighlightFeatures.splice(i, 1);
      }
      dispatch(setPreHighlightFeatures(newHighlightFeatures));

      dispatch(
        setLayerSettings({
          id: `gap-analysis-${id}`,
          settings: {
            visibility: layerSettings[`gap-analysis-${id}`]?.visibility || 1,
          },
        })
      );
    },
    [dispatch, setPreHighlightFeatures, setLayerSettings, layerSettings, preHighlightFeatures]
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
    <div className="relative">
      <div className="absolute -top-1 left-0 z-10 h-6 w-full bg-gradient-to-b from-gray-800 via-gray-800" />
      <div
        className={cn({
          'divide-y divide-dashed divide-black divide-opacity-20 bg-gray-800': true,
        })}
      >
        {allFeaturesIsFetching && !allFeaturesIsFetched && (
          <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center bg-gray-800 bg-opacity-90">
            <Loading
              visible
              className="z-40 flex w-full items-center justify-center "
              iconClassName="w-10 h-5 text-primary-500"
            />
            <div className="mt-5 font-heading text-xs uppercase">Loading Gap Analysis</div>
          </div>
        )}

        <ul className="py-6">
          {!allFeaturesIsFetching && (!allFeaturesData || !allFeaturesData.length) && <NoResults />}

          {allFeaturesData &&
            allFeaturesData.map((item, i) => {
              return (
                <li
                  key={`${item.id}`}
                  className={cn({
                    'border-t border-dashed': i !== 0,
                  })}
                >
                  <Item
                    {...item}
                    highlighted={isHighlighted(item.id)}
                    onHighlight={() => toggleHighlight(item.id)}
                    className="w-full"
                  />
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default ScenariosPreGapAnalysisList;
