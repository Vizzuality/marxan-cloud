import {
  isUnusedScenarioResourcesCleanupJobInput,
  UnusedProjectResourcesCleanupJobInput,
  UnusedResourcesCleanupJobInput,
  UnusedResourcesCleanupJobOutput,
  UnusedScenarioResourcesCleanupJobInput,
} from '@marxan/unused-resources-cleanup';
import { Injectable } from '@nestjs/common';
import { ProjectUnusedResources } from './delete-unused-resources/project-unused-resources';
import { ScenarioUnusedResources } from './delete-unused-resources/scenario-unused-resources';

@Injectable()
export class UnusedResourcesCleanupProcessor {
  constructor(
    private readonly projectUnusedResources: ProjectUnusedResources,
    private readonly scenarioUnusedResources: ScenarioUnusedResources,
  ) {}

  private async cleanProjectAndScenariosResources({
    projectId,
    scenarioIds,
    projectCustomFeaturesIds,
  }: UnusedProjectResourcesCleanupJobInput) {
    if (scenarioIds.length === 0)
      return this.projectUnusedResources.removeUnusedResources(projectId, {
        projectCustomFeaturesIds,
      });

    await Promise.all(
      scenarioIds.map((scenarioId) =>
        this.scenarioUnusedResources.removeUnusedResources(scenarioId),
      ),
    );

    return this.projectUnusedResources.removeUnusedResources(projectId, {
      projectCustomFeaturesIds,
    });
  }

  async run(
    input: UnusedResourcesCleanupJobInput,
  ): Promise<UnusedResourcesCleanupJobOutput> {
    const isScenarioCleanUp = isUnusedScenarioResourcesCleanupJobInput(input);

    if (isScenarioCleanUp) {
      await this.scenarioUnusedResources.removeUnusedResources(
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
