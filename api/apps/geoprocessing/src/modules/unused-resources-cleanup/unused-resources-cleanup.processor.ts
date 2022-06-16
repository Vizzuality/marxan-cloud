import {
  isUnusedScenarioResourcesCleanupJobInput,
  UnusedProjectResourcesCleanupJobInput,
  UnusedResourcesCleanupJobInput,
  UnusedResourcesCleanupJobOutput,
  UnusedScenarioResourcesCleanupJobInput,
} from '@marxan/unused-resources-cleanup';
import { Injectable } from '@nestjs/common';
import { DeleteProjectUnsusedReosurces } from './delete-unused-resources/delete-project-unused-resources';
import { DeleteScenarioUnsusedReosurces } from './delete-unused-resources/delete-scenario-unused-resources';

@Injectable()
export class UnusedResourcesCleanupProcessor {
  constructor(
    private readonly deleteProjectUnsusedReosurces: DeleteProjectUnsusedReosurces,
    private readonly deleteScenarioUnsusedReosurces: DeleteScenarioUnsusedReosurces,
  ) {}

  private async cleanProjectAndScenariosResources({
    projectId,
    scenarioIds,
    projectCustomFeaturesIds,
  }: UnusedProjectResourcesCleanupJobInput) {
    if (scenarioIds.length === 0)
      return this.deleteProjectUnsusedReosurces.removeUnusedResources(
        projectId,
        { projectCustomFeaturesIds },
      );

    await Promise.all(
      scenarioIds.map((scenarioId) =>
        this.deleteScenarioUnsusedReosurces.removeUnusedResources(scenarioId),
      ),
    );

    return this.deleteProjectUnsusedReosurces.removeUnusedResources(projectId, {
      projectCustomFeaturesIds,
    });
  }

  async run(
    input: UnusedResourcesCleanupJobInput,
  ): Promise<UnusedResourcesCleanupJobOutput> {
    const isScenarioCleanUp = isUnusedScenarioResourcesCleanupJobInput(input);

    if (isScenarioCleanUp) {
      await this.deleteScenarioUnsusedReosurces.removeUnusedResources(
        (input as UnusedScenarioResourcesCleanupJobInput).scenarioId,
      );
      return input;
    }

    await this.cleanProjectAndScenariosResources(
      input as UnusedProjectResourcesCleanupJobInput,
    );

    return input;
  }
}
