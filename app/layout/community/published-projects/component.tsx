import React, { useEffect } from 'react';

import { useDebouncedCallback } from 'use-debounce';
import { useSelector, useDispatch } from 'react-redux';
import { setSearch } from 'store/slices/community/projects';

import Link from 'next/link';

import { format } from 'd3';

import Button from 'components/button';
import Icon from 'components/icon';
import Loading from 'components/loading';
import Search from 'components/search';
import Wrapper from 'layout/wrapper';

import { usePublishedProjects } from 'hooks/projects';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-right-2.svg?sprite';
import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

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
              <tr>
                <th className="text-sm text-left w-96">
                  <h4 className="text-sm text-left">Name</h4>
                </th>
                <th className="text-sm text-left w-44">
                  <h4 className="text-sm text-left">Planning area</h4>
                </th>
                <th className="text-sm text-left w-44">
                  <h4 className="text-sm text-left">Creator</h4>
                </th>
                <th className="items-center w-72">
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
                  id: pid, name, description, planningArea, timesDuplicated, users,
                } = pp;
                return (
                  <tr key={pid} className="border-b border-white cursor-pointer border-opacity-20">
                    <Link href={`/community/projects/${pid}`}>
                      <td className="pr-4 py-7 w-96">
                        <p className="pb-1 font-semibold hover:underline">{name}</p>
                        <p className="text-base leading-normal text-gray-400 clamp-2">{description}</p>
                      </td>
                    </Link>
                    <td className="w-44">
                      <p className="text-sm">{planningArea}</p>
                    </td>
                    <td className="w-44">
                      {users?.map((u) => <p key={u.id} className="text-sm">{u.name}</p>)}
                    </td>
                    <td className="items-center w-72">
                      <div className="flex flex-row justify-between pl-10">
                        <p className="w-6 text-sm">{timesDuplicated && (format('.3s')(timesDuplicated))}</p>
                        <Button size="s" theme="transparent-white" className="px-6 group">
                          Duplicate
                          <Icon icon={DOWNLOAD_SVG} className="w-3.5 h-3.5 ml-2 text-white group-hover:text-black" />
                        </Button>
                      </div>
                    </td>
                  </tr>
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
