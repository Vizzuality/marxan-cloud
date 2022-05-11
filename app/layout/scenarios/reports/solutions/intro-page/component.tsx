import React from 'react';

import { useRouter } from 'next/router';

import { format } from 'date-fns';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';

export interface IntroPageProps {

}

export const IntroPage: React.FC<IntroPageProps> = () => {
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

  const reportDataIsFetched = projectDataIsFetched
    && scenarioDataIsFetched;

  return (
    reportDataIsFetched && (
      <div className="flex pt-6 space-x-4">

        <section className="w-1/2 space-y-8 text-xs">
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
          <div className="flex space-x-1">
            <p className="font-semibold">Description:</p>
            <p>
              {projectData?.description}
            </p>
          </div>
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

        </section>
      </div>
    )
  );
};

export default IntroPage;
