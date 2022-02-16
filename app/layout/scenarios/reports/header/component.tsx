import React from 'react';

import { useRouter } from 'next/router';

import { format } from 'date-fns';

import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';

export interface ScenariosReportHeaderProps {
  page: number,
  totalPages: number,
}

export const ScenariosReportHeader: React.FC<ScenariosReportHeaderProps> = ({
  page,
  totalPages,
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

  const projectOwner = projectUsers?.find((u) => u.roleName === 'project_owner').user.displayName;

  const reportDataIsFetched = projectDataIsFetched
    && scenarioDataIsFetched && projectUsersAreFetched;

  return (
    reportDataIsFetched && (
      <header className="w-full mb-12">

        <div className="flex justify-between">
          <div className="flex space-x-1 text-xs">
            <p className="font-semibold uppercase">
              Created by:
            </p>
            <p className="capitalize">{projectOwner}</p>
          </div>

          <p className="text-xs font-semibold ">
            {`Page ${page}/${totalPages}`}
          </p>
        </div>

        <h1 className="pb-6 text-2xl text-gray-500 font-heading">
          {`${projectData.name}-${scenarioData.name}`}
        </h1>

        <div className="flex space-x-12 text-xxs">
          <div className="flex space-x-1">
            <p className="font-semibold">Marxan platform version:</p>
            <p> V.0.0.1</p>
          </div>
          <div className="flex space-x-1">
            <p className="font-semibold">Date:</p>
            <p>{format(new Date().getTime(), 'MM/dd/yyyy')}</p>
          </div>
        </div>
      </header>
    )
  );
};

export default ScenariosReportHeader;
