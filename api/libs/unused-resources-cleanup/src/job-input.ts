export type UnusedProjectResourcesCleanupJobInput = {
  projectId: string;
  scenarioIds: string[];
  projectCustomFeaturesIds: string[];
};
export type UnusedScenarioResourcesCleanupJobInput = { scenarioId: string };

export type UnusedResourcesCleanupJobInput =
  | UnusedProjectResourcesCleanupJobInput
  | UnusedScenarioResourcesCleanupJobInput;

export function isUnusedScenarioResourcesCleanupJobInput(
  jobInput: UnusedResourcesCleanupJobInput,
): jobInput is UnusedScenarioResourcesCleanupJobInput {
  return (
    (jobInput as UnusedScenarioResourcesCleanupJobInput).scenarioId !==
    undefined
  );
}
