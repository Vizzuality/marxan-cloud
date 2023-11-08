import React, { useCallback } from 'react';

import { useRouter } from 'next/router';

import { useAllPaginatedFeatures } from 'hooks/features';

import Item from 'components/features/raw-item';
import Loading from 'components/loading';
import NoResults from 'layout/project/sidebar/project/inventory-panel/components/no-results';
import { cn } from 'utils/cn';

export interface ScenariosFeaturesAddListProps {
  search?: string;
  filters?: Record<string, any>;
  sort?: string;
  selected: number[] | string[];
  onToggleSelected: (selected: string | number) => void;
}

export const ScenariosFeaturesAddList: React.FC<ScenariosFeaturesAddListProps> = ({
  search,
  filters,
  sort,
  selected = [],
  onToggleSelected,
}: ScenariosFeaturesAddListProps) => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const { data: allFeaturesData, isFetching: allFeaturesIsFetching } = useAllPaginatedFeatures(
    pid,
    {
      search,
      filters,
      sort,
    }
  );

  // Callbacks
  const handleToggleSelected = useCallback(
    (id) => {
      if (onToggleSelected) onToggleSelected(id);
    },
    [onToggleSelected]
  );

  return (
    <div className="relative flex flex-grow flex-col overflow-hidden" style={{ minHeight: 200 }}>
      <div className="pointer-events-none absolute -top-1 left-0 z-10 h-6 w-full bg-gradient-to-b from-white via-white" />

      <div
        className={cn({
          'divide-y divide-dashed divide-black divide-opacity-20 overflow-y-auto overflow-x-hidden bg-white px-8':
            true,
        })}
      >
        {allFeaturesIsFetching && (
          <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center bg-white bg-opacity-90">
            <Loading
              visible
              className="z-40 flex w-full items-center justify-center "
              iconClassName="w-10 h-10 text-primary-500"
            />
            <div className="mt-2.5 font-heading text-xs uppercase">Loading features</div>
          </div>
        )}

        <div>
          {!allFeaturesIsFetching && (!allFeaturesData || !allFeaturesData.length) && <NoResults />}

          {allFeaturesData &&
            allFeaturesData.map((item) => {
              const isSelected = selected.findIndex((f) => f === item.id) !== -1;

              return (
                <div key={`${item.id}`} className="border-t border-dashed first:border-t-0">
                  <Item
                    {...item}
                    selected={isSelected}
                    onToggleSelected={() => {
                      handleToggleSelected(item.id);
                    }}
                  />
                </div>
              );
            })}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-6 w-full bg-gradient-to-t from-white via-white" />
    </div>
  );
};

export default ScenariosFeaturesAddList;
