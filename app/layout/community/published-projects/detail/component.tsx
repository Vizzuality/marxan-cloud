import React from 'react';

import { useRouter } from 'next/router';

import { format } from 'd3';

import { useProjectUsers } from 'hooks/project-users';
import { usePublishedProject } from 'hooks/published-projects';
import { useScenarios } from 'hooks/scenarios';

import PublishedProjectMap from 'layout/community/published-projects/detail/map';
import Share from 'layout/community/published-projects/detail/share';
import DuplicateButton from 'layout/community/published-projects/duplicate-button';
import ComingSoon from 'layout/help/coming-soon';
import Backlink from 'layout/statics/backlink';
import Wrapper from 'layout/wrapper';

import Avatar from 'components/avatar';
import Loading from 'components/loading';

export interface CommunityProjectsDetailProps {

}

export const CommunityProjectsDetail: React.FC<CommunityProjectsDetailProps> = () => {
  const { query } = useRouter();
  const { pid } = query;

  const { data: projectUsers } = useProjectUsers(pid);
  const size = 3;
  const firstProjectUsers = projectUsers?.slice(0, size);

  const {
    data: publishedProject,
    isFetching: publishedProjectIsFetching,
  } = usePublishedProject(pid);

  const {
    data: publishedProjectScenarios,
    isFetching: publishedProjectScenariosIsFetching,
  } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const {
    id, description, name, planningAreaName, timesDuplicated,
  } = publishedProject || {};

  const scenarios = publishedProjectScenarios || [];

  const planningArea = planningAreaName || 'Custom';

  return (
    <div className="text-black bg-primary-50">
      <Wrapper>
        <div className="w-full max-w-5xl mx-auto my-32">

          <Backlink href="/community/projects">
            Projects
          </Backlink>
          <div className="relative" style={{ minHeight: 600 }}>

            {publishedProject && scenarios && (
              <div className="flex flex-row">
                <div className="w-7/12 pr-12">

                  <h2 className="mt-5 mb-12 text-4xl font-medium text-left font-heading">
                    {name}
                  </h2>

                  <p className="mb-10 text-sm leading-normal text-gray-400">
                    {description}
                  </p>

                  <div className="flex flex-row items-center mb-10">

                    <ComingSoon theme="dark" placement="top">
                      <DuplicateButton
                        id={id}
                        name={name}
                        theme="dark"
                      />
                    </ComingSoon>

                    {timesDuplicated && (
                      <p className="ml-5 text-sm">
                        Duplicated
                        {format('.3s')(timesDuplicated)}
                        {' '}
                        times
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 grid-rows-2 gap-y-9 gap-x-9">

                    <div>
                      <h3 className="mb-5 text-sm font-semibold">Contributors</h3>
                      {!!firstProjectUsers?.length && (
                        <div className="space-y-4">
                          {firstProjectUsers.map((u) => {
                            const { user: { displayName, id: userId, avatarDataUrl } } = u;

                            return (
                              <div key={userId} className="flex flex-row items-center space-x-2.5">
                                <Avatar
                                  className="text-sm text-white uppercase border bg-primary-700"
                                  bgImage={avatarDataUrl}
                                  name={displayName}
                                >
                                  {!avatarDataUrl && displayName.slice(0, 2)}
                                </Avatar>
                                <p className="text-sm">{displayName}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-6 text-sm font-semibold">Planning area</h3>
                      <p className="text-lg">{planningArea}</p>
                    </div>

                    {!!scenarios.length && (
                      <div>
                        <h3 className="mb-6 text-sm font-semibold">Scenarios</h3>
                        <p className="text-sm">
                          {scenarios?.length}
                          {' '}
                          scenarios
                        </p>
                        <p className="text-sm">
                          Last creation:
                          {' '}
                          {scenarios[0].lastUpdateDistance}
                        </p>
                      </div>
                    )}

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
      <Loading
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
        visible={publishedProjectIsFetching && publishedProjectScenariosIsFetching}
      />

    </div>
  );
};

export default CommunityProjectsDetail;
