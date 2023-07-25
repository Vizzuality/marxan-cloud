import { useCallback, useState, ChangeEvent } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { setSelectedFeatures as setVisibleFeatures } from 'store/slices/projects/[id]';

import { ArrowDown, ArrowUp } from 'lucide-react';

import { useAllFeatures } from 'hooks/features';

import Checkbox from 'components/forms/checkbox';
import Loading from 'components/loading';
import { ProjectFeature } from 'types/project-model';
import { cn } from 'utils/cn';

import FeatureItemList from './item';

export const ProjectFeatureList = (): JSX.Element => {
  const dispatch = useDispatch();
  const { selectedFeatures: visibleFeatures } = useSelector((state) => state['/projects/[id]']);
  const [filters, setFilters] = useState<Parameters<typeof useAllFeatures>[1]>({
    sort: 'featureClassName',
  });
  const [selectedFeatures, setSelectedFeatures] = useState<ProjectFeature['id'][]>([]);
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const allFeaturesQuery = useAllFeatures<ProjectFeature[]>(
    pid,
    {
      ...filters,
    },
    {
      select: ({ data: features }) =>
        // todo: remove this when the API is ready
        features.map((feature, index) => ({
          ...feature,
          tag: feature.tag ?? `random tag ${index}`,
          scenarios: feature.scenarios ?? 10,
        })),
      placeholderData: { data: [] },
      keepPreviousData: true,
    }
  );
  const featureIds = allFeaturesQuery.data?.map((feature) => feature.id);

  const handleSelectAll = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setSelectedFeatures(evt.target.checked ? featureIds : []);
    },
    [featureIds]
  );

  const handleSelectFeature = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    if (evt.target.checked) {
      setSelectedFeatures((prevSelectedFeatures) => [...prevSelectedFeatures, evt.target.value]);
    } else {
      setSelectedFeatures((prevSelectedFeatures) =>
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
    (featureId: ProjectFeature['id']) => {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-8 py-2">
        <div className="col-span-1 flex items-center space-x-2">
          <Checkbox
            id="select-all"
            theme="light"
            className="form-checkbox-dark block h-4 w-4 text-yellow-200"
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
      <div className="relative min-h-[200px] ">
        <Loading
          visible={allFeaturesQuery.isFetching}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <ul className="divide-y divide-gray-400">
          {allFeaturesQuery.data?.map((feature) => (
            <li key={feature.id} className="flex items-center justify-between py-2 ">
              <FeatureItemList
                feature={feature}
                projectId={pid}
                onSelectFeature={handleSelectFeature}
                isSelected={selectedFeatures.includes(feature.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectFeatureList;
