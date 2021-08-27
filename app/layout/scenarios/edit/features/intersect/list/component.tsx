import React, { useCallback } from 'react';

import { useRouter } from 'next/router';

import cx from 'classnames';

import { useAllFeatures } from 'hooks/features';
import useBottomScrollListener from 'hooks/scroll';

import Item from 'components/features/intersect-item';
import Loading from 'components/loading';

export interface ScenariosFeaturesIntersectListProps {
  search?: string;
  selected: Record<string, unknown>[];
  onSelected: (selected: string | number) => void;
  onSplitSelected: (id: string | number, key: string) => void;
  onSplitFeaturesSelected: (selected: string | number, key: string) => void;
}

export const ScenariosFeaturesIntersectList: React.FC<ScenariosFeaturesIntersectListProps> = ({
  search,
  selected = [],
  onSelected,
  onSplitSelected,
  onSplitFeaturesSelected,
}: ScenariosFeaturesIntersectListProps) => {
  const { query } = useRouter();
  const { pid } = query;

  const {
    data: allFeaturesData,
    fetchNextPage: allFeaturesfetchNextPage,
    hasNextPage,
    isFetching: allFeaturesIsFetching,
    isFetchingNextPage: allFeaturesIsFetchingNextPage,
    isFetched: allFeaturesIsFetched,
  } = useAllFeatures(pid, {
    search,
    filters: {
      tag: 'bioregional',
    },
  });

  const scrollRef = useBottomScrollListener(
    () => {
      if (hasNextPage) allFeaturesfetchNextPage();
    },
  );

  // Callbacks
  const handleSelected = useCallback((feature) => {
    if (onSelected) onSelected(feature);
  }, [onSelected]);

  const handleSplitSelected = useCallback((id, key) => {
    if (onSplitSelected) onSplitSelected(id, key);
  }, [onSplitSelected]);

  const handleSplitFeaturesSelected = useCallback((id, key) => {
    if (onSplitFeaturesSelected) onSplitFeaturesSelected(id, key);
  }, [onSplitFeaturesSelected]);

  return (
    <div className="relative flex flex-col flex-grow overflow-hidden" style={{ minHeight: 200 }}>
      <div className="absolute left-0 z-10 w-full h-6 pointer-events-none -top-1 bg-gradient-to-b from-white via-white" />

      <div
        ref={scrollRef}
        className={cx({
          'bg-white divide-y divide-black divide-dashed divide-opacity-20 overflow-y-auto overflow-x-hidden px-8': true,
        })}
      >
        {(allFeaturesIsFetching && !allFeaturesIsFetched) && (
          <div className="absolute top-0 left-0 z-10 flex flex-col items-center justify-center w-full h-full bg-white bg-opacity-90">
            <Loading
              visible
              className="z-40 flex items-center justify-center w-full "
              iconClassName="w-10 h-10 text-primary-500"
            />
            <div className="mt-5 text-xs uppercase font-heading">Loading features</div>
          </div>
        )}

        <div className="py-3" style={{ transform: 'translateZ(0)' }}>
          {(!allFeaturesIsFetching && (!allFeaturesData || !allFeaturesData.length)) && (
            <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
              No results found
            </div>
          )}

          {allFeaturesData && allFeaturesData.map((item, i) => {
            const selectedItem = selected.find((f) => f.id === item.id);
            const selectedIndex = selected.findIndex((f) => f.id === item.id);

            return (
              <div
                key={`${item.id}`}
                className={cx({
                  'border-t border-dashed': i !== 0,
                })}
              >
                <Item
                  {...item}
                  {...selectedItem}
                  scrollRoot={scrollRef}
                  selected={selectedIndex !== -1}
                  onSelected={() => {
                    handleSelected(item);
                  }}
                  onSplitSelected={(s) => {
                    handleSplitSelected(item.id, s);
                  }}
                  onSplitFeaturesSelected={(s) => {
                    handleSplitFeaturesSelected(item.id, s);
                  }}
                />

              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-white via-white" />

      <div
        className={cx({
          'opacity-100': allFeaturesIsFetchingNextPage,
          'absolute left-0 z-20 w-full text-xs text-center uppercase bottom-0 font-heading transition opacity-0 pointer-events-none': true,
        })}
      >
        <div className="py-1 bg-gray-200">Loading more...</div>
        <div className="w-full h-6 bg-white" />
      </div>
    </div>
  );
};

export default ScenariosFeaturesIntersectList;
