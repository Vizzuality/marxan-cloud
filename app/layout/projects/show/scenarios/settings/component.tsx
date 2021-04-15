import React from 'react';

import Loading from 'components/loading';

import { useScenario } from 'hooks/scenarios';

export interface ProjectScenariosSettingsProps {
  sid: string;
}

export const ProjectScenariosSettings: React.FC<ProjectScenariosSettingsProps> = ({
  sid,
}:ProjectScenariosSettingsProps) => {
  const {
    data: scenarioData,
    isFetching: scenarioIsFetching,
  } = useScenario(sid);

  if (scenarioIsFetching) {
    return (
      <Loading
        visible
        className="z-40 flex items-center justify-center w-full h-12 bg-transparent bg-opacity-90"
        iconClassName="w-5 h-5 text-primary-500"
      />
    );
  }

  const {
    wdpaIucnCategories,
    numberOfRuns,
    boundaryLengthModifier,
  } = scenarioData;

  return (
    <dl className="flex flex-col space-x-2">
      <div className="flex space-x-2 text-sm">
        <dt>Protected areas:</dt>
        <dd className="px-1.5 text-blue-400 bg-blue-400 bg-opacity-30 rounded">{(wdpaIucnCategories || []).length || '-'}</dd>
      </div>
      <div className="flex space-x-2 text-sm">
        <dt>Features:</dt>
        <dd className="px-1.5 text-blue-400 bg-blue-400 bg-opacity-30 rounded">-</dd>
      </div>
      <div className="flex space-x-2 text-sm">
        <dt>Runs:</dt>
        <dd>{numberOfRuns || '-'}</dd>
      </div>
      <div className="flex space-x-2 text-sm">
        <dt>BLM:</dt>
        <dd>{boundaryLengthModifier || '-'}</dd>
      </div>
      {/* <div className="flex space-x-2 text-sm">
        <dt>Schedules:</dt>
        <dd className="px-1.5 text-blue-400 bg-blue-400 bg-opacity-30 rounded">2</dd>
      </div> */}
    </dl>
  );
};

export default ProjectScenariosSettings;
