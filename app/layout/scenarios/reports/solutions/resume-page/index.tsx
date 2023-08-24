import React from 'react';

import { useRouter } from 'next/router';

import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario, useScenarioPU } from 'hooks/scenarios';

export const ResumePage = (): JSX.Element => {
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };
  const projectQuery = useProject(pid);
  const scenarioQuery = useScenario(sid);

  const projectUsersQuery = useProjectUsers(pid);
  const PUDataQuery = useScenarioPU(sid);

  const THEME = {
    section: 'pb-6',
    title: 'pb-3 text-xs font-semibold',
    text: 'text-xs leading-4',
  };

  return (
    <div className="flex flex-col space-y-14 border-t border-gray-100">
      <div className="pt-10">
        {scenarioQuery.data?.description && (
          <div>
            <h3 className={THEME.title}>Description:</h3>
            <p className={THEME.text}>{scenarioQuery.data?.description}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-10">
        <div>
          <div className={THEME.section}>
            <h3 className={THEME.title}>Contributors:</h3>
            <p className={THEME.text}>
              {projectUsersQuery.data?.map((u) => u.user.displayName).join('; ')}
            </p>
          </div>

          <div className={THEME.section}>
            <h3 className={THEME.title}>Cost surface:</h3>
            <p className={THEME.text}>Lorem Ipsum</p>
          </div>

          {projectQuery.data?.planningUnitAreakm2 && (
            <div className={THEME.section}>
              <h3 className={THEME.title}>Planning Area (KM2):</h3>
              <p className={THEME.text}>{projectQuery.data?.planningUnitAreakm2}</p>
            </div>
          )}

          {projectQuery.data?.planningUnitGridShape && (
            <div className={THEME.section}>
              <h3 className={THEME.title}>Planning Unit Grid Shape:</h3>
              <p className={THEME.text}>{projectQuery.data?.planningUnitGridShape}</p>
            </div>
          )}

          <div className={THEME.section}>
            <h3 className={THEME.title}>Planning Unit Grid Area:</h3>
            <p className={THEME.text}>Lorem Ipsum</p>
          </div>
        </div>
        <div>
          <div className={THEME.section}>
            <h3 className={THEME.title}>Protected Areas:</h3>
            <p className={THEME.text}>Lorem Ipsum</p>
          </div>

          <div className={THEME.section}>
            <h3 className={THEME.title}>No. of planning units:</h3>
            <div className="flex flex-col space-y-3">
              <p className={THEME.text}>Total: {PUDataQuery.data?.available.length}</p>
              <p className={THEME.text}>Included PU: {PUDataQuery.data?.included.length}</p>
              <p className={THEME.text}>Excluded PU: {PUDataQuery.data?.excluded.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
