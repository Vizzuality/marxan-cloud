import React from 'react';

import { useRouter } from 'next/router';

import { format } from 'd3';

import { usePublishedProject } from 'hooks/projects';

import Avatar from 'components/avatar';
import Loading from 'components/loading';

import Backlink from 'layout/statics/backlink';
import DuplicateButton from 'layout/community/published-projects/duplicate-button';
import PublishedProjectMap from 'layout/community/published-projects/detail/map';
import Share from 'layout/community/published-projects/detail/share';
import Wrapper from 'layout/wrapper';

import { MOCK_CONTRIBUTORS } from './constants';

export interface CommunityProjectsDetailProps {

}

export const CommunityProjectsDetail: React.FC<CommunityProjectsDetailProps> = () => {
  const { query } = useRouter();
  const { pid } = query;
  const {
    data: publishedProject,
    isFetching: publishedProjectIsFetching,
  } = usePublishedProject(pid);

  const {
    id, description, name, planningAreaName, timesDuplicated, scenarios,
  } = publishedProject || {};

  return (
    <Wrapper>
      <div className="w-full max-w-5xl mx-auto my-32">

        <Backlink href="/community/projects">
          Projects
        </Backlink>

        <div className="relative" style={{ minHeight: 600 }}>
          {publishedProjectIsFetching && (
            <div className="absolute flex items-center justify-center w-full h-full py-12">
              <Loading
                className="w-10 h-10 text-white"
                iconClassName="w-10 h-10"
                visible
              />
            </div>
          )}

          {publishedProject && (
            <div className="flex flex-row">
              <div className="w-7/12 pr-12">

                <h2
                  className="mt-5 mb-12 text-4xl font-medium text-left font-heading"
                >
                  { name}
                </h2>

                <p className="mb-10 text-sm leading-normal text-gray-400">
                  {description}
                </p>

                <div className="flex flex-row items-center mb-10">
                  <DuplicateButton
                    id={id}
                    name={name}
                  />
                  {timesDuplicated && (
                    <p className="ml-5 text-sm text-white">
                      Duplicated
                      {format('.3s')(timesDuplicated)}
                      {' '}
                      times
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 grid-rows-2 gap-y-11 gap-x-9">

                  <div>
                    <h3 className="mb-6 text-sm font-semibold text-white">Creators</h3>
                    {MOCK_CONTRIBUTORS?.map((u) => (
                      <div key={u.id} className="flex flex-row items-center mb-5">
                        <Avatar bgImage={u.avatar || '/images/avatar.png'} size="s" />
                        <p className="ml-5 text-sm text-white">{u.name}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-6 text-sm font-semibold text-white">Planning area</h3>
                    <p className="text-lg text-white">{planningAreaName}</p>
                  </div>

                  <div>
                    <h3 className="mb-6 text-sm font-semibold text-white">Scenarios</h3>
                    {scenarios && (
                      <>
                        <p className="text-sm text-white">Marxan Standard</p>
                        <p className="text-sm text-white">
                          {scenarios.length}
                          {' '}
                          scenarios
                        </p>
                        <p className="text-sm text-white">Last creation: 2 days ago</p>
                      </>
                    )}
                  </div>

                  <Share />

                </div>
              </div>

              <div
                className="w-5/12 mt-6"
                style={{ maxHeight: 500 }}
              >
                <PublishedProjectMap />
              </div>

            </div>
          )}
        </div>

      </div>
    </Wrapper>
  );
};

export default CommunityProjectsDetail;
