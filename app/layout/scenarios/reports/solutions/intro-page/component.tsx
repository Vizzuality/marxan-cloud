import React from 'react';

import { useRouter } from 'next/router';

import { format } from 'date-fns';

import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';

import LOGO_BLACK from 'svgs/logo-black.svg';

export interface IntroPageProps {}

export const IntroPage: React.FC<IntroPageProps> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const { data: projectData, isFetched: projectDataIsFetched } = useProject(pid);

  const { data: scenarioData, isFetched: scenarioDataIsFetched } = useScenario(sid);

  const { data: projectUsers, isFetched: projectUsersAreFetched } = useProjectUsers(pid);

  const projectOwner = projectUsers?.find((u) => u.roleName === 'project_owner')?.user || {};

  const reportDataIsFetched =
    projectDataIsFetched && scenarioDataIsFetched && projectUsersAreFetched;

  const { description, name, planningAreaName, planningUnitGridShape, planningUnitAreakm2 } =
    projectData || {};

  return (
    reportDataIsFetched && (
      <div className="space-y-6 pt-6">
        <div className="flex justify-between">
          <div>
            <div className="flex space-x-1 text-xs">
              <p className="font-semibold uppercase">Created by:</p>
              <p className="capitalize">{projectOwner?.displayName || projectOwner?.email}</p>
            </div>
            <h1 className="pb-2 font-heading text-2xl font-semibold text-gray-500">
              Solution Report
            </h1>
          </div>
          <img className="h-12 w-32" alt="Marxan logo" src={LOGO_BLACK} />
        </div>
        <section className="w-1/2 space-y-8 text-xs">
          <div className="flex flex-col space-y-3 text-xs">
            <div className="flex space-x-1">
              <p className="font-semibold">Project:</p>
              <p>{name}</p>
            </div>

            <div className="flex space-x-1">
              <p className="font-semibold">Scenario:</p>
              <p>{scenarioData?.name}</p>
            </div>

            <div className="flex space-x-1">
              <p className="font-semibold">Description:</p>
              <p>{description}</p>
            </div>

            <div className="flex space-x-1">
              <p className="font-semibold">Planning Area:</p>
              <p>{planningAreaName || 'Custom'}</p>
            </div>

            <div className="flex space-x-1">
              <p className="font-semibold">Planning Unit Area:</p>
              <p>
                {planningUnitAreakm2
                  ? `${planningUnitAreakm2}
                km2`
                  : 'Custom'}
              </p>
            </div>
            <div className="flex space-x-1">
              <p className="font-semibold">Planning Unit Grid Shape:</p>
              <p>
                {planningUnitGridShape === 'hexagon' || planningUnitGridShape === 'square'
                  ? planningUnitGridShape
                  : 'Custom'}
              </p>
            </div>

            <div className="flex space-x-1">
              <p className="font-semibold">Marxan platform version:</p>
              <p> V.0.0.1</p>
            </div>
            <div className="flex space-x-1">
              <p className="font-semibold">Date:</p>
              <p>{format(new Date().getTime(), 'MM/dd/yyyy')}</p>
            </div>
          </div>
        </section>
      </div>
    )
  );
};

export default IntroPage;
