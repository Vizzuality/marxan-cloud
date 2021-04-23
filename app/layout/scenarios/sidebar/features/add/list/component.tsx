import React, { useCallback } from 'react';
import cx from 'classnames';

import Loading from 'components/loading';
import Item from 'components/features/raw-item';

import { useAllFeatures } from 'hooks/features';
import { useRouter } from 'next/router';
import useBottomScrollListener from 'hooks/scroll';

export interface ScenariosFeaturesAddListProps {
  search?: string;
  selected: number[] | string[];
  onToggleSelected: (selected: string | number) => void;
}

export const ScenariosFeaturesAddList: React.FC<ScenariosFeaturesAddListProps> = ({
  selected = [],
  onToggleSelected,
}: ScenariosFeaturesAddListProps) => {
  const { query } = useRouter();
  const { pid } = query;

  const {
    data: allFeaturesData,
    fetchNextPage: allFeaturesfetchNextPage,
    isFetching: allFeaturesIsFetching,
    isFetchingNextPage: allFeaturesIsFetchingNextPage,
    isFetched: allFeaturesIsFetched,
  } = useAllFeatures(pid);

  const scrollRef = useBottomScrollListener(
    () => {
      allFeaturesfetchNextPage();
    },
  );

  // Callbacks
  const handleToggleSelected = useCallback((id) => {
    if (onToggleSelected) onToggleSelected(id);
  }, [onToggleSelected]);

  if (allFeaturesIsFetching && !allFeaturesIsFetched) {
    return (
      <Loading
        visible
        className="z-40 flex items-center justify-center w-full h-40 bg-transparent bg-opacity-90"
        iconClassName="w-5 h-5 text-primary-500"
      />
    );
  }

  return (
    <div className="relative flex flex-col flex-grow overflow-hidden">
      <div className="absolute left-0 z-10 w-full h-6 -top-1 bg-gradient-to-b from-white via-white" />

      <div
        ref={scrollRef}
        className={cx({
          'bg-white divide-y divide-black divide-dashed divide-opacity-20 overflow-y-auto overflow-x-hidden px-8': true,
        })}
      >
        <div>
          {(!allFeaturesData || !allFeaturesData.length) && (
            <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
              No results found
            </div>
          )}

          {allFeaturesData && allFeaturesData.map((item, i) => {
            const selectedIndex = selected.findIndex((f) => f === item.id);

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
                  selected={selectedIndex !== -1}
                  onToggleSelected={() => {
                    handleToggleSelected(item.id);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 z-10 w-full h-6 bg-gradient-to-t from-white via-white" />

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

export default ScenariosFeaturesAddList;
