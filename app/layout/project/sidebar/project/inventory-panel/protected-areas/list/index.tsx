import { useCallback, useState, ChangeEvent } from 'react';

import { useRouter } from 'next/router';

import { ArrowDown, ArrowUp } from 'lucide-react';

import { useAllFeatures } from 'hooks/features';

import Checkbox from 'components/forms/checkbox';
import Loading from 'components/loading';
import ProtectedAreaItemList from 'layout/project/sidebar/project/inventory-panel/protected-areas/list/item';
import { Feature } from 'types/feature';
import { cn } from 'utils/cn';

// import ProtectedAreasBulkActionMenu from '../bulk-action-menu';

export const ProtectedAreasList = (): JSX.Element => {
  const [filters, setFilters] = useState<Parameters<typeof useAllFeatures>[1]>({
    sort: 'featureClassName',
  });
  const [selectedFeaturesIds, setSelectedFeaturesIds] = useState<Feature['id'][]>([]);
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const allFeaturesQuery = useAllFeatures<Feature[]>(
    pid,
    {
      ...filters,
    },
    {
      select: ({ data }) => data,
      placeholderData: { data: [] },
      keepPreviousData: true,
    }
  );
  const featureIds = allFeaturesQuery.data?.map((feature) => feature.id);

  const handleSelectAll = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setSelectedFeaturesIds(evt.target.checked ? featureIds : []);
    },
    [featureIds]
  );

  const handleSelectFeature = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    if (evt.target.checked) {
      setSelectedFeaturesIds((prevSelectedFeatures) => [...prevSelectedFeatures, evt.target.value]);
    } else {
      setSelectedFeaturesIds((prevSelectedFeatures) =>
        prevSelectedFeatures.filter((featureId) => featureId !== evt.target.value)
      );
    }
  }, []);

  const handleSort = useCallback(
    (_sortType: (typeof filters)['sort']) => {
      const sort = filters.sort === _sortType ? `-${_sortType}` : _sortType;

      setFilters((prevFilters) => ({
        ...prevFilters,
        sort,
      }));
    },
    [filters.sort]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-8 py-2 pl-1">
        <div className="col-span-1 flex items-center space-x-2">
          <Checkbox
            id="select-all"
            theme="light"
            className="block h-4 w-4 checked:bg-blue-400"
            onChange={handleSelectAll}
          />
          <button
            type="button"
            className="flex items-center space-x-2"
            onClick={() => handleSort('featureClassName')}
          >
            <span
              className={cn({
                'leading-none text-gray-400': true,
                'text-white': filters.sort.includes('featureClassName'),
              })}
            >
              Name
            </span>
            {filters.sort === 'featureClassName' ? (
              <ArrowDown
                className={filters.sort === 'featureClassName' ? 'text-blue-400' : 'text-gray-400'}
                size={20}
              />
            ) : (
              <ArrowUp
                className={filters.sort === '-featureClassName' ? 'text-blue-400' : 'text-gray-400'}
                size={20}
              />
            )}
          </button>
        </div>
      </div>
      <div className="relative min-h-[100px]">
        <Loading
          visible={allFeaturesQuery.isFetching}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <div className="space-y-6">
          <ul className="max-h-[calc(100vh-400px)] divide-y divide-gray-400 overflow-y-auto pl-1 pr-2">
            {allFeaturesQuery.data?.map((feature) => (
              <li
                key={feature.id}
                className="flex items-center justify-between border-b border-gray-400/50 py-2"
              >
                <ProtectedAreaItemList
                  feature={feature}
                  projectId={pid}
                  onSelectFeature={handleSelectFeature}
                  isSelected={selectedFeaturesIds.includes(feature.id)}
                />
              </li>
            ))}
          </ul>
          {/* {selectedFeaturesIds.length > 0 && (
            <ProtectedAreasBulkActionMenu selectedFeaturesIds={selectedFeaturesIds} />
          )} */}
        </div>
      </div>
    </div>
  );
};

export default ProtectedAreasList;
