import {
  isUnusedScenarioResourcesCleanupJobInput,
  UnusedProjectResourcesCleanupJobInput,
  UnusedResourcesCleanupJobInput,
  UnusedResourcesCleanupJobOutput,
  UnusedScenarioResourcesCleanupJobInput,
} from '@marxan/unused-resources-cleanup';
import { Injectable } from '@nestjs/common';
import { DeleteProjectUnusedResources } from './delete-unused-resources/delete-project-unused-resources';
import { DeleteScenarioUnusedResources } from './delete-unused-resources/delete-scenario-unused-resources';

@Injectable()
export class UnusedResourcesCleanupProcessor {
  constructor(
    private readonly deleteProjectUnusedResources: DeleteProjectUnusedResources,
    private readonly deleteScenarioUnusedResources: DeleteScenarioUnusedResources,
  ) {}

  private async cleanProjectAndScenariosResources({
    projectId,
    scenarioIds,
    projectCustomFeaturesIds,
  }: UnusedProjectResourcesCleanupJobInput) {
    if (scenarioIds.length === 0)
      return this.deleteProjectUnusedResources.removeUnusedResources(
        projectId,
        { projectCustomFeaturesIds },
      );

    await Promise.all(
      scenarioIds.map((scenarioId) =>
        this.deleteScenarioUnusedResources.removeUnusedResources(scenarioId),
      ),
    );

    return this.deleteProjectUnusedResources.removeUnusedResources(projectId, {
      projectCustomFeaturesIds,
    });
  }

  async run(
    input: UnusedResourcesCleanupJobInput,
  ): Promise<UnusedResourcesCleanupJobOutput> {
    const isScenarioCleanUp = isUnusedScenarioResourcesCleanupJobInput(input);

    if (isScenarioCleanUp) {
      await this.deleteScenarioUnusedResources.removeUnusedResources(
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
