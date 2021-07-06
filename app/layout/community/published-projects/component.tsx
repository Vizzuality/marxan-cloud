import React from 'react';

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

  return (
    <Wrapper>
      <div className="w-full max-w-5xl mx-auto py-18">
        <Search
          id="project-search"
          // defaultValue={search}
          size="base"
          placeholder="Search projects, locations, creators, features..."
          aria-label="Search"
          // onChange={(value) => { dispatch(setSearch(value)); }}
        />
        <h3 className="pt-10 text-2xl font-heading">
          Projects published (
          {publishedProjectsData.length}
          )
        </h3>
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
          {publishedProjectsIsFetching && <Loading />}
          {publishedProjectsData && publishedProjectsIsFetched && (
            <tbody>
              {publishedProjectsData.map((pp) => {
                const {
                  id, name, description, planningArea, timesDuplicated, users,
                } = pp;
                return (
                  <tr key={id} className="border-b border-white cursor-pointer border-opacity-20">
                    <Link href="projects/1">
                      <td className="pb-10">
                        <p className="font-semibold hover:underline">{name}</p>
                        <p className="text-base leading-normal text-gray-400">{description}</p>
                      </td>
                    </Link>
                    <td>
                      <p className="text-sm">{planningArea}</p>
                    </td>
                    <td>
                      {users?.map((u) => <p key={u.id} className="text-sm">{u.name}</p>)}
                    </td>
                    <td>
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
          )}
        </table>
      </div>
    </Wrapper>
  );
};

export default CommunityProjectsList;
