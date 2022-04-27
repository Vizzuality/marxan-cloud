import React from 'react';

import { useRouter } from 'next/router';

import { format } from 'd3';

import { usePublishedProject } from 'hooks/published-projects';

import Share from 'layout/community/published-projects/detail/share';
import DuplicateButton from 'layout/community/published-projects/list/table/duplicate-button';
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

  const {
    data: publishedProject,
    isFetching: publishedProjectIsFetching,
    isFetched: publishedProjectIsFetched,
  } = usePublishedProject(pid);

  const {
    creators,
  } = publishedProject;

  const creatorsVisibleSize = 3;
  const creatorsVisible = creators?.slice(0, creatorsVisibleSize);

  const {
    id, description, name, planningAreaName, timesDuplicated, company, pngData,
  } = publishedProject || {};

  const planningArea = planningAreaName || 'Custom';

  return (
    <div className="text-black bg-primary-50">
      <Wrapper>
        <div className="w-full max-w-5xl mx-auto my-32">

          <Backlink href="/community/projects">
            Projects
          </Backlink>

          <div className="relative" style={{ minHeight: 600 }}>
            {publishedProject && (
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
                      {!!creatorsVisible?.length && (
                        <div className="space-y-4">
                          {creatorsVisible.map((u) => {
                            const {
                              displayName, id: userId, avatarDataUrl,
                            } = u;

                            return (
                              <div key={userId} className="flex flex-row items-center space-x-2.5">
                                <Avatar
                                  className="text-sm text-white uppercase border bg-primary-700"
                                  bgImage={avatarDataUrl}
                                  name={displayName}
                                >
                                  {!avatarDataUrl && (displayName).slice(0, 2)}
                                </Avatar>
                                <p className="text-sm">{(displayName)}</p>
                              </div>
                            );
                          })}
                          {creators?.length > creatorsVisibleSize && (
                            <div className="flex flex-row items-center space-x-2.5">
                              <Avatar className="text-sm text-white uppercase border bg-primary-700" />
                              <p className="text-sm">
                                {`(+${creators.length - creatorsVisibleSize})`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-6 text-sm font-semibold">Planning area</h3>
                      <p className="text-lg">{planningArea}</p>
                    </div>

                    {!!company && (
                      <div>
                        <h3 className="mb-6 text-sm font-semibold">Creator</h3>
                        <div className="w-28">
                          <img src={company.logoDataUrl} alt={company.name} className="max-w-full" />
                        </div>
                      </div>
                    )}

                    <Share />

                  </div>
                </div>

                <div
                  className="w-5/12 mt-6"
                  style={{ maxHeight: 500 }}
                >
                  <div
                    className="bg-primary-500 rounded-xl overflow-hidden"
                    style={{
                      width: 500,
                      height: 500,
                    }}
                  >
                    {pngData && (
                      <img
                        src={`data:image/png;base64,${pngData}`}
                        alt={name}
                        className="max-w-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Wrapper>
      <Loading
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-gray-50 bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
        visible={
          publishedProjectIsFetching
          && !publishedProjectIsFetched
        }
      />

    </div>
  );
};

export default CommunityProjectsDetail;
