import {
  UnusedProjectResourcesCleanupJobInput,
  UnusedResourcesCleanupJobInput,
  UnusedResourcesCleanupJobOutput,
} from '@marxan/unused-resources-cleanup';
import { Injectable } from '@nestjs/common';
import { ProjectUnusedResources } from './delete-unused-resources/project-unused-resources';
import { ScenarioUnusedResources } from './delete-unused-resources/scenario-unused-resources';
import { CostSurfaceUnusedResources } from '@marxan-geoprocessing/modules/unused-resources-cleanup/delete-unused-resources/cost-surface-unused-resources';

@Injectable()
export class UnusedResourcesCleanupProcessor {
  constructor(
    private readonly projectUnusedResources: ProjectUnusedResources,
    private readonly scenarioUnusedResources: ScenarioUnusedResources,
    private readonly costSurfaceUnusedResources: CostSurfaceUnusedResources,
  ) {}

  private async cleanProjectAndScenariosResources({
    projectId,
    scenarioIds,
    projectCustomFeaturesIds,
  }: UnusedProjectResourcesCleanupJobInput) {
    if (scenarioIds.length > 0) {
      await Promise.all(
        scenarioIds.map((scenarioId) =>
          this.scenarioUnusedResources.removeUnusedResources(scenarioId),
        ),
      );
    }

    return this.projectUnusedResources.removeUnusedResources(projectId, {
      projectCustomFeaturesIds,
    });
  }

  async run(
    input: UnusedResourcesCleanupJobInput,
  ): Promise<UnusedResourcesCleanupJobOutput> {
    if (input.type === 'Scenario') {
      await this.scenarioUnusedResources.removeUnusedResources(
        input.scenarioId,
      );
    } else if (input.type === 'Project') {
      await this.cleanProjectAndScenariosResources(input);
    } else if (input.type === 'Cost Surface') {
      await this.costSurfaceUnusedResources.removeUnusedResources(
        input.costSurfaceId,
      );
    }

    return input;
  }
}
