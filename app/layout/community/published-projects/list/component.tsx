import React, { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { setSearch } from 'store/slices/community/projects';

import { useDebouncedCallback } from 'use-debounce';

import { usePublishedProjects } from 'hooks/published-projects';

import Loading from 'components/loading';
import Search from 'components/search';
import Wrapper from 'layout/wrapper';

import CommunityProjectsTable from './table';

export interface CommunityProjectsListProps {}

export const CommunityProjectsList: React.FC<CommunityProjectsListProps> = () => {
  const { search } = useSelector((state) => state['/community/projects']);
  const dispatch = useDispatch();

  const { data: publishedProjectsData, isFetching: publishedProjectsIsFetching } =
    usePublishedProjects({
      search,
    });

  const onChangeSearchDebounced = useDebouncedCallback((value) => {
    dispatch(setSearch(value));
  }, 500);

  useEffect(() => {
    return function unmount() {
      dispatch(setSearch(null));
    };
  }, [dispatch]);

  return (
    <div className="bg-white pt-12 text-black">
      <Wrapper>
        <div className="mx-auto w-full max-w-5xl pb-20">
          <Search
            id="project-search"
            defaultValue={search}
            size="base"
            placeholder="Search by project name, planning area..."
            aria-label="Search"
            onChange={onChangeSearchDebounced}
            theme="light"
          />

          <h3 className="pt-10 font-heading text-2xl">
            Projects published ({publishedProjectsData.length})
          </h3>

          <div className="relative" style={{ minHeight: 250 }}>
            {publishedProjectsIsFetching && (
              <div className="absolute flex h-full w-full items-center justify-center py-12">
                <Loading
                  className="flex h-full w-full items-center justify-center text-white"
                  iconClassName="w-10 h-10"
                  visible
                />
              </div>
            )}

            <CommunityProjectsTable data={publishedProjectsData} />
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default CommunityProjectsList;
