import React from 'react';

import { useRouter } from 'next/router';

import { useSelectedFeatures } from 'hooks/features';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import Loading from 'components/loading';

export interface ProjectScenariosSettingsProps {
  sid: string;
}

export const ProjectScenariosSettings: React.FC<ProjectScenariosSettingsProps> = ({
  sid,
}: ProjectScenariosSettingsProps) => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const { data: scenarioData, isFetching: scenarioIsFetching } = useScenario(sid);

  const { data: projectData } = useProject(pid);

  const { data: selectedFeaturesData = [] } = useSelectedFeatures(sid, {});

  const { data: protectedAreasData, isFetching: protectedAreasDataIsFetching } = useWDPACategories({
    adminAreaId:
      projectData?.adminAreaLevel2Id || projectData?.adminAreaLevel1I || projectData?.countryId,
    customAreaId:
      !projectData?.adminAreaLevel2Id && !projectData?.adminAreaLevel1I && !projectData?.countryId
        ? projectData?.planningAreaId
        : null,
    scenarioId: sid,
  });

  const protectedAreas = protectedAreasData?.filter((a) => a.selected).map((a) => a.name);

  if (scenarioIsFetching || protectedAreasDataIsFetching) {
    return (
      <Loading
        visible
        className="h-26 z-40 flex w-full items-center justify-center bg-transparent bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
    );
  }

  const { numberOfRuns, boundaryLengthModifier } = scenarioData;

  return (
    <dl className="flex flex-col space-y-2">
      <div className="flex space-x-2 text-sm">
        <dt>Conservation areas:</dt>
        <dd className="rounded bg-blue-500 bg-opacity-30 px-1.5 text-blue-500">
          {protectedAreas?.length || '-'}
        </dd>
      </div>
      <div className="flex space-x-2 text-sm">
        <dt>Features:</dt>
        <dd className="rounded bg-blue-500 bg-opacity-30 px-1.5 text-blue-500">
          {selectedFeaturesData?.length || '-'}
        </dd>
      </div>
      <div className="flex space-x-2 text-sm">
        <dt>Runs:</dt>
        <dd className="rounded bg-blue-500 bg-opacity-30 px-1.5 text-blue-500">
          {numberOfRuns || '-'}
        </dd>
      </div>
      <div className="flex space-x-2 text-sm">
        <dt>BLM:</dt>
        <dd className="rounded bg-blue-500 bg-opacity-30 px-1.5 text-blue-500">
          {boundaryLengthModifier || '-'}
        </dd>
      </div>
    </dl>
  );
};

export default ProjectScenariosSettings;
