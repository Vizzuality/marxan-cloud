import React, { useEffect } from 'react';

import { useDebouncedCallback } from 'use-debounce';
import { useSelector, useDispatch } from 'react-redux';
import { setSearch } from 'store/slices/community/projects';

import Icon from 'components/icon';
import Loading from 'components/loading';
import PublishedItem from 'components/projects/published-item';
import Search from 'components/search';
import Wrapper from 'layout/wrapper';

import { usePublishedProjects } from 'hooks/projects';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface CommunityProjectsListProps {

}

export const CommunityProjectsList: React.FC<CommunityProjectsListProps> = () => {
  const {
    data: publishedProjectsData,
    isFetching: publishedProjectsIsFetching,
    isFetched: publishedProjectsIsFetched,
  } = usePublishedProjects();

  const { search } = useSelector((state) => state['/community/projects']);
  const dispatch = useDispatch();

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
      <div className="w-full max-w-5xl mx-auto py-18">
        <Search
          id="project-search"
          defaultValue={search}
          size="base"
          placeholder="Search projects, locations, creators, features..."
          aria-label="Search"
          onChange={onChangeSearchDebounced}
        />
        <h3 className="pt-10 text-2xl font-heading">
          Projects published (
          {publishedProjectsData.length}
          )
        </h3>
        {publishedProjectsIsFetching && (
          <div className="flex items-center justify-center py-12">
            <Loading
              className="w-10 h-10 text-white"
              iconClassName="w-10 h-10"
              visible
            />
          </div>
        )}
        {publishedProjectsData && publishedProjectsIsFetched && (
          <table>
            <thead className="h-32">
              <tr className="flex flex-row">
                <div className="py-12 w-96">
                  <h4 className="text-sm text-left">Name</h4>
                </div>
                <div className="py-12 w-44">
                  <h4 className="text-sm text-left">Planning area</h4>
                </div>
                <div className="py-12 w-44">
                  <h4 className="text-sm text-left">Creator</h4>
                </div>
                <div className="items-center p-12 w-72">
                  <div className="flex flex-row">
                    <h4 className="text-sm text-left">Duplicated</h4>
                    <Icon icon={ARROW_DOWN_SVG} className="w-3.5 h-3.5 ml-2 text-white transform rotate-90" />
                  </div>
                </div>
              </tr>
            </thead>
            <tbody>
              {publishedProjectsData.map((pp) => {
                const {
                  id: pid, name, description, planningArea, timesDuplicated, users,
                } = pp;

                return (
                  <PublishedItem
                    key={pid}
                    id={pid}
                    name={name}
                    description={description}
                    area={planningArea}
                    contributors={users}
                    timesDuplicated={timesDuplicated}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Wrapper>
  );
};

export default CommunityProjectsList;
