import React from 'react';

import { useRouter } from 'next/router';

import { useProjectCostSurfaces } from 'hooks/cost-surface';
import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario, useScenarioPU } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

export const ResumePage = (): JSX.Element => {
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };
  const projectQuery = useProject(pid);
  const scenarioQuery = useScenario(sid);
  const ScenarioWPDACategoriesQuery = useWDPACategories({
    scenarioId: sid,
  });

  const costSurfaceQuery = useProjectCostSurfaces(
    pid,
    {},
    {
      select: (data) =>
        data.filter((cs) => cs.scenarios.filter((s) => s.id === sid).length > 0)?.[0],
    }
  );

  const projectUsersQuery = useProjectUsers(pid);
  const PUDataQuery = useScenarioPU(sid);

  const selectedScenarioWDPACategories = ScenarioWPDACategoriesQuery.data
    ?.filter(({ selected }) => selected)
    .map(({ name }) => name);

  const SECTION_CLASSES = 'pb-6';
  const TITLE_CLASSES = 'pb-3 text-sm font-semibold';
  const TEXT_CLASSES = 'text-sm leading-4';

  return (
    <div className="flex flex-col border-t border-gray-200">
      {scenarioQuery.data?.description && (
        <div className="pt-10">
          <div>
            <h3 className={TITLE_CLASSES}>Description:</h3>
            <p className={TEXT_CLASSES}>{scenarioQuery.data?.description}</p>
          </div>
        </div>
      )}
      <div className="mt-10 grid grid-cols-2 gap-20">
        <div>
          <div className={SECTION_CLASSES}>
            <h3 className={TITLE_CLASSES}>Contributors:</h3>
            <p className={TEXT_CLASSES}>
              {projectUsersQuery.data?.map((u) => u.user.displayName).join('; ')}
            </p>
          </div>

          <div className={SECTION_CLASSES}>
            <h3 className={TITLE_CLASSES}>Cost surface:</h3>
            <p className={TEXT_CLASSES}>{costSurfaceQuery.data?.name}</p>
          </div>

          {projectQuery.data?.planningUnitAreakm2 && (
            <div className={SECTION_CLASSES}>
              <h3 className={TITLE_CLASSES}>Planning Unit Grid Area (KM2):</h3>
              <p className={TEXT_CLASSES}>{projectQuery.data?.planningUnitAreakm2}</p>
            </div>
          )}

          {projectQuery.data?.planningUnitGridShape && (
            <div className={SECTION_CLASSES}>
              <h3 className={TITLE_CLASSES}>Planning Unit Grid Shape:</h3>
              <p className={TEXT_CLASSES}>{projectQuery.data?.planningUnitGridShape}</p>
            </div>
          )}
        </div>
        <div>
          <div className={SECTION_CLASSES}>
            <h3 className={TITLE_CLASSES}>Conservation Areas:</h3>
            <p className={TEXT_CLASSES}>{selectedScenarioWDPACategories?.join(', ')}</p>
          </div>

          <div className={SECTION_CLASSES}>
            <h3 className={TITLE_CLASSES}>No. of planning units:</h3>
            <div className="flex flex-col space-y-3">
              <p className={TEXT_CLASSES}>Available PU: {PUDataQuery.data?.available.length}</p>
              <p className={TEXT_CLASSES}>Included PU: {PUDataQuery.data?.included.length}</p>
              <p className={TEXT_CLASSES}>Excluded PU: {PUDataQuery.data?.excluded.length}</p>
              <p className={TEXT_CLASSES}>Total PU: {PUDataQuery.data?.total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
