import React from 'react';

import { useRouter } from 'next/router';

import { useSelectedFeatures } from 'hooks/features';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import Loading from 'components/loading';
import { Scenario } from 'types/api/scenario';

const ScenarioSettings = ({ id }: { id: Scenario['id'] }): JSX.Element => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const { data: scenarioData, isFetching: scenarioIsFetching } = useScenario(id);

  const { data: projectData } = useProject(pid);

  const { data: selectedFeaturesData = [] } = useSelectedFeatures(id, {});

  const { data: protectedAreasData, isFetching: protectedAreasDataIsFetching } = useWDPACategories({
    adminAreaId:
      projectData?.adminAreaLevel2Id || projectData?.adminAreaLevel1I || projectData?.countryId,
    customAreaId:
      !projectData?.adminAreaLevel2Id && !projectData?.adminAreaLevel1I && !projectData?.countryId
        ? projectData?.planningAreaId
        : null,
    scenarioId: id,
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

  return (
    <dl className="grid w-full grid-cols-2 flex-col gap-x-10 gap-y-2 rounded-b-3xl bg-gray-800 px-8 pb-4 pt-6 text-xs">
      <div className="flex space-x-2">
        <dt>Protected areas:</dt>
        <dd className="rounded bg-blue-500 bg-opacity-30 px-1.5 text-sm text-blue-500">
          {protectedAreas?.length || '-'}
        </dd>
      </div>
      <div className="flex space-x-2">
        <dt>Features:</dt>
        <dd className="rounded bg-blue-500 bg-opacity-30 px-1.5 text-sm text-blue-500">
          {selectedFeaturesData?.length || '-'}
        </dd>
      </div>
      <div className="flex space-x-2">
        <dt>Runs:</dt>
        <dd className="rounded bg-blue-500 bg-opacity-30 px-1.5 text-sm text-blue-500">
          {scenarioData?.numberOfRuns || '-'}
        </dd>
      </div>
      <div className="flex space-x-2">
        <dt>BLM:</dt>
        <dd className="rounded bg-blue-500 bg-opacity-30 px-1.5 text-sm text-blue-500">
          {scenarioData?.boundaryLengthModifier || '-'}
        </dd>
      </div>
    </dl>
  );
};

export default ScenarioSettings;
