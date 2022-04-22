import React, { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { setSearch } from 'store/slices/community/projects';

import { useDebouncedCallback } from 'use-debounce';

import { usePublishedProjects } from 'hooks/published-projects';

import Wrapper from 'layout/wrapper';

import Loading from 'components/loading';
import Search from 'components/search';

import CommunityProjectsTable from './table';

export interface CommunityProjectsListProps {

}

export const CommunityProjectsList: React.FC<CommunityProjectsListProps> = () => {
  const { search } = useSelector((state) => state['/community/projects']);
  const dispatch = useDispatch();

  const {
    data: publishedProjectsData,
    isFetching: publishedProjectsIsFetching,
  } = usePublishedProjects({
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
    <div className="pt-12 text-black bg-white">
      <Wrapper>
        <div className="w-full max-w-5xl pb-20 mx-auto">
          <Search
            id="project-search"
            defaultValue={search}
            size="base"
            placeholder="Search by project name, planning area..."
            aria-label="Search"
            onChange={onChangeSearchDebounced}
            theme="light"
          />

          <h3 className="pt-10 text-2xl font-heading">
            Projects published (
            {publishedProjectsData.length}
            )
          </h3>

          <div className="relative" style={{ minHeight: 250 }}>
            {publishedProjectsIsFetching && (
              <div className="absolute flex items-center justify-center w-full h-full py-12">
                <Loading
                  className="flex items-center justify-center w-full h-full text-white"
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
