import React from 'react';

import { useRouter } from 'next/router';

import { format } from 'date-fns';

import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';

export const ReportHeader = (): JSX.Element => {
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const projectQuery = useProject(pid);

  const scenarioQuery = useScenario(sid);

  const projectUsersQuery = useProjectUsers(pid);

  const projectOwner =
    projectUsersQuery.data?.find((u) => u.roleName === 'project_owner')?.user || {};

  const reportDataIsFetched =
    projectQuery.isFetched && scenarioQuery.isFetched && projectUsersQuery.isFetched;

  return (
    reportDataIsFetched && (
      <header className="flex w-full items-start justify-between pb-4">
        <div className="mx-auto flex w-11/12 flex-col space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h1 className="text-xl font-medium">{projectQuery.data?.name}</h1>

            <div className="flex items-center space-x-6 text-lg">
              <h2>{scenarioQuery.data?.name}</h2>
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
      </header>
    )
  );
};

export default ReportHeader;
