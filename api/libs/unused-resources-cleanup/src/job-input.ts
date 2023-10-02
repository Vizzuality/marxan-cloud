export type UnusedProjectResourcesCleanupJobInput = {
  type: 'Project';
  projectId: string;
  scenarioIds: string[];
  projectCustomFeaturesIds: string[];
};
export type UnusedScenarioResourcesCleanupJobInput = {
  type: 'Scenario';
  scenarioId: string;
};

export type UnusedCostSurfaceResourcesCleanupJobInput = {
  type: 'Cost Surface';
  costSurfaceId: string;
};

export type UnusedResourcesCleanupJobInput =
  | UnusedProjectResourcesCleanupJobInput
  | UnusedScenarioResourcesCleanupJobInput
  | UnusedCostSurfaceResourcesCleanupJobInput;

export function isUnusedScenarioResourcesCleanupJobInput(
  jobInput: UnusedResourcesCleanupJobInput,
): jobInput is UnusedScenarioResourcesCleanupJobInput {
  return (
    (jobInput as UnusedScenarioResourcesCleanupJobInput).scenarioId !==
    undefined
  );
}
