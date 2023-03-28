import React from 'react';

import { useRouter } from 'next/router';

import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';

export interface ScenariosReportHeaderProps {
  title: string;
}

export const ScenariosReportHeader: React.FC<ScenariosReportHeaderProps> = ({
  title,
}: ScenariosReportHeaderProps) => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const {
    data: projectData,
    isFetched: projectDataIsFetched,
  } = useProject(pid);

  const {
    data: scenarioData,
    isFetched: scenarioDataIsFetched,
  } = useScenario(sid);

  const {
    data: projectUsers,
    isFetched: projectUsersAreFetched,
  } = useProjectUsers(pid);

  const projectOwner = projectUsers?.find((u) => u.roleName === 'project_owner')?.user || {};

  const reportDataIsFetched = projectDataIsFetched
    && scenarioDataIsFetched && projectUsersAreFetched;

  return (
    reportDataIsFetched && (
      <header className="flex items-start justify-between w-full pb-6">
        <div className="w-1/3">
          <div className="flex justify-between">
            <div className="flex space-x-1 text-xs">
              <p className="font-semibold uppercase">
                Created by:
              </p>
              <p className="capitalize">{projectOwner?.displayName || projectOwner?.email}</p>
            </div>
          </div>

          <h1 className="pb-2 text-2xl font-semibold text-gray-500 font-heading">
            {title}
          </h1>
          <div className="flex flex-col text-xxs">
            <div className="flex space-x-1">
              <p className="font-semibold">Project:</p>
              <p>
                {projectData?.name}
              </p>
            </div>

            <div className="flex space-x-1">
              <p className="font-semibold">Scenario:</p>
              <p>
                {scenarioData?.name}
              </p>
            </div>
          </div>

        </div>

        <img
          className="w-32 h-12"
          alt="Marxan logo"
          src="/images/logo-black.png"
        />

      </header>
    )
  );
};

export default ScenariosReportHeader;
