import React, { useCallback } from 'react';

import { useRouter } from 'next/router';

import { useAllPaginatedFeatures } from 'hooks/features';
import useBottomScrollListener from 'hooks/scroll';

import Item from 'components/features/intersect-item';
import Loading from 'components/loading';
import NoResults from 'layout/project/sidebar/project/inventory-panel/components/no-results';
import { cn } from 'utils/cn';

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
  const { pid } = query as { pid: string };

  const {
    data: allFeaturesData,
    fetchNextPage: allFeaturesfetchNextPage,
    hasNextPage,
    isFetching: allFeaturesIsFetching,
    isFetchingNextPage: allFeaturesIsFetchingNextPage,
    isFetched: allFeaturesIsFetched,
  } = useAllPaginatedFeatures(pid, {
    search,
  });

  const scrollRef = useBottomScrollListener(() => {
    if (hasNextPage) allFeaturesfetchNextPage();
  });

  // Callbacks
  const handleSelected = useCallback(
    (feature) => {
      if (onSelected) onSelected(feature);
    },
    [onSelected]
  );

  const handleSplitSelected = useCallback(
    (id, key) => {
      if (onSplitSelected) onSplitSelected(id, key);
    },
    [onSplitSelected]
  );

  const handleSplitFeaturesSelected = useCallback(
    (id, key) => {
      if (onSplitFeaturesSelected) onSplitFeaturesSelected(id, key);
    },
    [onSplitFeaturesSelected]
  );

  return (
    <div className="relative flex flex-grow flex-col overflow-hidden" style={{ minHeight: 200 }}>
      <div className="pointer-events-none absolute -top-1 left-0 z-10 h-6 w-full bg-gradient-to-b from-white via-white" />

      <div
        ref={scrollRef}
        className={cn({
          'divide-y divide-dashed divide-black divide-opacity-20 overflow-y-auto overflow-x-hidden bg-white px-8':
            true,
        })}
      >
        {allFeaturesIsFetching && !allFeaturesIsFetched && (
          <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center bg-white bg-opacity-90">
            <Loading
              visible
              className="z-40 flex w-full items-center justify-center "
              iconClassName="w-10 h-10 text-primary-500"
            />
            <div className="mt-5 font-heading text-xs uppercase">Loading features</div>
          </div>
        )}

        <div className="py-3" style={{ transform: 'translateZ(0)' }}>
          {!allFeaturesIsFetching && (!allFeaturesData || !allFeaturesData.length) && <NoResults />}

          {allFeaturesData &&
            allFeaturesData.map((item, i) => {
              const selectedItem = selected.find((f) => f.id === item.id);
              const selectedIndex = selected.findIndex((f) => f.id === item.id);

              return (
                <div
                  key={`${item.id}`}
                  className={cn({
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

      <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-6 w-full bg-gradient-to-t from-white via-white" />

      <div
        className={cn({
          'opacity-100': allFeaturesIsFetchingNextPage,
          'pointer-events-none absolute bottom-0 left-0 z-20 w-full text-center font-heading text-xs uppercase opacity-0 transition':
            true,
        })}
      >
        <div className="bg-gray-300 py-1">Loading more...</div>
        <div className="h-6 w-full bg-white" />
      </div>
    </div>
  );
};

export default ScenariosFeaturesIntersectList;
