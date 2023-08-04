import { useCallback, useState, ChangeEvent, useEffect } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSelectedFeatures as setVisibleFeatures } from 'store/slices/projects/[id]';

import { ArrowDown, ArrowUp } from 'lucide-react';

import { useAllFeatures } from 'hooks/features';

import Checkbox from 'components/forms/checkbox';
import Loading from 'components/loading';
import { Feature } from 'types/api/feature';
import { cn } from 'utils/cn';

import FeaturesBulkActionMenu from '../bulk-action-menu';

import FeatureItemList from './item';

export const ProjectFeatureList = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { selectedFeatures: visibleFeatures, search } = useAppSelector(
    (state) => state['/projects/[id]']
  );
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
      search,
    },
    {
      select: ({ data }) => data,
      placeholderData: { data: [] },
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

  // ! this feature is partially implement until the API is ready
  // ! This is about previewing the feature on the map
  const toggleSeeOnMap = useCallback(
    (featureId: Feature['id']) => {
      const newSelectedFeatures = [...visibleFeatures];

      if (!newSelectedFeatures.includes(featureId)) {
        newSelectedFeatures.push(featureId);
      } else {
        const i = newSelectedFeatures.indexOf(featureId);
        newSelectedFeatures.splice(i, 1);
      }
      dispatch(setVisibleFeatures(newSelectedFeatures));
    },
    [dispatch, visibleFeatures]
  );

  useEffect(() => {
    setSelectedFeaturesIds([]);
  }, [search]);

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
        <div className="col-span-1 flex items-center space-x-2">
          <button
            type="button"
            className="flex items-center space-x-2"
            onClick={() => handleSort('tag')}
          >
            <span
              className={cn({
                'leading-none text-gray-400': true,
                'text-white': filters.sort.includes('tag'),
              })}
            >
              Type
            </span>
            {filters.sort === 'tag' ? (
              <ArrowDown
                className={filters.sort === 'tag' ? 'text-blue-400' : 'text-gray-400'}
                size={20}
              />
            ) : (
              <ArrowUp
                className={filters.sort === '-tag' ? 'text-blue-400' : 'text-gray-400'}
                size={20}
              />
            )}
          </button>
        </div>
      </div>
      <div className="relative">
        {allFeaturesQuery.isFetching && (
          <div className="relative min-h-[200px]">
            <Loading
              visible={allFeaturesQuery.isFetching}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        )}
        {!allFeaturesQuery.data?.length && allFeaturesQuery.isFetching === false && (
          <div className="flex h-[200px] items-center justify-center">No features found.</div>
        )}
        {!allFeaturesQuery.isFetching && (
          <div className="flex min-h-0 flex-grow flex-col overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-6 before:w-[calc(100%-20px)] before:bg-gradient-to-b before:from-gray-700 before:content-[''] after:absolute after:bottom-0 after:left-0 after:z-10 after:h-6 after:w-[calc(100%-20px)] after:bg-gradient-to-t after:from-gray-700 after:content-['']">
            {/* <div className="absolute left-0 top-0 z-10 h-6 w-[calc(100%-20px)] bg-gradient-to-b from-gray-700 via-gray-700" /> */}
            <ul className="max-h-[calc(100vh-400px)] divide-y divide-gray-400 overflow-y-auto py-3 pl-1 pr-2">
              {allFeaturesQuery.data?.map((feature) => (
                <li key={feature.id} className="flex items-center justify-between py-2 ">
                  <FeatureItemList
                    feature={feature}
                    projectId={pid}
                    onSelectFeature={handleSelectFeature}
                    isSelected={selectedFeaturesIds.includes(feature.id)}
                  />
                </li>
              ))}
            </ul>

            {selectedFeaturesIds.length > 0 && (
              <FeaturesBulkActionMenu selectedFeaturesIds={selectedFeaturesIds} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectFeatureList;
