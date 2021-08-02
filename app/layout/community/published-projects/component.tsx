import React, { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { usePublishedProjects } from 'hooks/projects';

import { setSearch } from 'store/slices/community/projects';
import { useDebouncedCallback } from 'use-debounce';

import Wrapper from 'layout/wrapper';

import Icon from 'components/icon';
import Loading from 'components/loading';
import PublishedItem from 'components/projects/published-item';
import Search from 'components/search';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

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
    <Wrapper>
      <div className="w-full max-w-5xl pb-20 mx-auto">
        <Search
          id="project-search"
          defaultValue={search}
          size="base"
          placeholder="Search by project name, planning area, creators..."
          aria-label="Search"
          onChange={onChangeSearchDebounced}
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

          {publishedProjectsData && (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="py-12 font-normal w-96">
                    <h4 className="text-sm text-left">Name</h4>
                  </th>
                  <th className="py-12 font-normal w-44">
                    <h4 className="text-sm text-left">Planning area</h4>
                  </th>
                  <th className="py-12 font-normal w-44">
                    <h4 className="text-sm text-left">Creator</h4>
                  </th>
                  <th className="py-12 font-normal w-72">
                    <div className="flex flex-row">
                      <h4 className="text-sm text-left">Duplicated</h4>
                      <Icon icon={ARROW_DOWN_SVG} className="w-3.5 h-3.5 ml-2 text-white transform rotate-90" />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {publishedProjectsData.map((pp) => {
                  const {
                    id: pid, name, description, area, timesDuplicated, contributors,
                  } = pp;

                  return (
                    <PublishedItem
                      key={pid}
                      id={pid}
                      name={name}
                      description={description}
                      area={area}
                      contributors={contributors}
                      timesDuplicated={timesDuplicated}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default CommunityProjectsList;
