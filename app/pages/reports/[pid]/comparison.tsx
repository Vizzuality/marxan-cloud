import React from 'react';

import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';

import { useAppSelector } from 'store/hooks';

import { format } from 'date-fns';

import { useLegend } from 'hooks/map';
import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';

import Head from 'layout/head';
import MetaIcons from 'layout/meta-icons/component';
import ScreenshotMap from 'layout/project/reports/comparison/map';
import WebShotStatus from 'layout/project/reports/comparison/webshot-status';

export const getServerSideProps = withProtection(withUser());

const styles = {
  page: {
    minHeight: '297mm',
    margin: 'auto',
    padding: '8.73mm 13.49mm',
    width: '200mm',
    'break-after': 'page',
  },
};

const ComparisonScreenshot = (): JSX.Element => {
  const { query } = useRouter();
  const { pid, sid1, sid2 } = query as { pid: string; sid1: string; sid2: string };

  const { layerSettings } = useAppSelector((state) => state['/projects/[id]']);

  const { data: projectData, isFetched: projectDataIsFetched } = useProject(pid);
  const { data: projectUsers, isFetched: projectUsersAreFetched } = useProjectUsers(pid);
  const projectOwner = projectUsers?.find((u) => u.roleName === 'project_owner')?.user || {};
  const { data: scenarioData1, isFetched: scenarioData1IsFetched } = useScenario(sid1);
  const { data: scenarioData2, isFetched: scenarioDatarIsFetched } = useScenario(sid2);

  const reportDataIsFetched =
    projectDataIsFetched &&
    projectUsersAreFetched &&
    scenarioData1IsFetched &&
    scenarioDatarIsFetched;

  const items = [
    { value: scenarioData1.name, color: '#DE3397' },
    { value: scenarioData2.name, color: '#1C9BD0' },
  ];

  const legend = useLegend({
    layers: [...(!!sid1 && !!sid2 ? ['compare'] : [])],
    options: {
      layerSettings,
    },
  });

  const compareIntersections = legend?.find((l) => l.id === 'compare').intersections;

  return (
    <>
      <Head title="Comparison screenshot" />
      <MetaIcons />
      <div style={styles.page} className="flex h-full flex-col space-y-6 bg-white text-black">
        <header className="flex w-full items-start justify-between pb-6">
          <div className="mx-auto w-11/12">
            <div className="flex flex-col space-y-8">
              <div>
                <h1 className="text-xl font-medium">{projectData?.name}</h1>

                <div className="flex items-center space-x-6 text-lg">
                  <h2>{scenarioData1?.name}</h2>
                  <div className="h-5 w-[3px] bg-gray-100" />
                  <h2>{scenarioData2?.name}</h2>
                </div>
              </div>

              <div className="flex h-4 items-center space-x-4 text-xs">
                <div className="flex space-x-2">
                  <p className="font-medium uppercase">Created by:</p>
                  <p className="capitalize">{projectOwner?.displayName || projectOwner?.email}</p>
                </div>
                <div className="h-5 w-[2px] bg-gray-100" />
                <div className="flex space-x-2">
                  <p className="font-medium uppercase">Marxan platform version:</p>
                  <p> V.0.0.1</p>
                </div>
                <div className="h-5 w-[2px] bg-gray-100" />
                <div className="flex space-x-2">
                  <p className="font-medium uppercase">Date:</p>
                  <p>{format(new Date().getTime(), 'MM/dd/yyyy')}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto w-11/12">
          <ScreenshotMap id="comparison-map-1" />
        </div>
        {reportDataIsFetched && (
          <div className="flex items-start justify-between space-x-14 bg-gray-50 px-16 py-12">
            <div className="flex flex-col space-y-8 text-base text-black">
              <p className="font-semibold"> Solutions Distribution:</p>
              <ul className="flex w-full flex-col space-y-2">
                {items.map(({ value, color }) => (
                  <li
                    key={`${value}`}
                    className="flex items-center space-x-2 font-heading text-base"
                  >
                    <div
                      className="h-5 w-5 flex-shrink-0 rounded-sm"
                      style={{
                        backgroundColor: color,
                      }}
                    />
                    <div className="line-clamp-2">{value}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative ml-10 w-16 flex-shrink-0 py-12">
              <p className="absolute left-1/2 top-1 -translate-x-1/2 transform font-heading text-xxs font-medium text-black">
                Always
              </p>
              <p className="absolute bottom-1 left-1/2 -translate-x-1/2 transform font-heading text-xxs font-medium text-black">
                Never
              </p>
              <div className="preserve-3d w-full rotate-45 transform">
                <div className="w-full" style={{ paddingBottom: '100%' }}>
                  <div className="absolute left-0 top-0 flex h-full w-full flex-wrap">
                    {compareIntersections?.map((i) => (
                      <div
                        key={i.id}
                        className="relative block"
                        style={{
                          background: `${i.color}`,
                          width: `${100 / 11}%`,
                          height: `${100 / 11}%`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="absolute bottom-0 left-full z-10 h-full w-2 transform justify-between font-heading text-xxs text-black">
                    <div
                      className="absolute flex h-px items-center space-x-1 leading-none"
                      style={{ bottom: `${(100 / 11) * 2}%` }}
                    >
                      <span className="relative top-px block h-px w-1 bg-gray-300" />
                      <span className="relative block -rotate-45 transform">
                        <span>10</span>
                      </span>
                    </div>
                    <div
                      className="absolute flex h-px items-center space-x-1 leading-none"
                      style={{ bottom: `${(100 / 11) * 6}%` }}
                    >
                      <span className="relative top-px block h-px w-1 bg-gray-300" />
                      <span className="relative block -rotate-45 transform">
                        <span>50</span>
                      </span>
                    </div>
                    <div
                      className="absolute flex h-px items-center space-x-1 leading-none"
                      style={{ bottom: '100%' }}
                    >
                      <span className="relative top-px block h-px w-1 bg-gray-300" />
                      <span className="relative block -rotate-45 transform">
                        <span>100</span>
                      </span>
                    </div>
                  </div>

                  <div className="absolute -bottom-1 -left-1 z-10 h-full w-2 origin-bottom rotate-90 transform justify-between font-heading text-xxs text-black">
                    <div
                      className="absolute flex h-px transform items-center space-x-1 leading-none"
                      style={{ bottom: `${100 - (100 / 11) * 2}%` }}
                    >
                      <span className="relative top-px block h-px w-1 bg-gray-300" />
                      <span className="relative block -rotate-180 transform">
                        <span className="relative block rotate-45 transform">10</span>
                      </span>
                    </div>
                    <div
                      className="absolute flex h-px transform items-center space-x-1 leading-none"
                      style={{ bottom: `${100 - (100 / 11) * 6}%` }}
                    >
                      <span className="relative top-px block h-px w-1 bg-gray-300" />
                      <span className="relative block -rotate-180 transform">
                        <span className="relative block rotate-45 transform">50</span>
                      </span>
                    </div>
                    <div
                      className="absolute flex h-px transform items-center space-x-1 leading-none"
                      style={{ bottom: '0%' }}
                    >
                      <span className="relative top-px block h-px w-1 bg-gray-300" />
                      <span className="relative block -rotate-180 transform">
                        <span className="relative block rotate-45 transform">100</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <WebShotStatus />
    </>
  );
};

export default ComparisonScreenshot;
