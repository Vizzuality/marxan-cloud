import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { left, right } from 'fp-ts/lib/Either';
import { Repository } from 'typeorm';
import { ProjectDeleted } from '../events/project-deleted.event';
import { Project } from '../project.api.entity';
import {
  DeleteProject,
  deleteProjectFailed,
  DeleteProjectResponse,
} from './delete-project.command';

@CommandHandler(DeleteProject)
export class DeleteProjectHandler
  implements IInferredCommandHandler<DeleteProject> {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(GeoFeature)
    private readonly featuresRepo: Repository<GeoFeature>,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ projectId }: DeleteProject): Promise<DeleteProjectResponse> {
    try {
      const [project] = await this.projectRepo.find({
        where: { id: projectId },
        relations: ['scenarios'],
      });

      const scenarioIds: string[] = [];
      if (project.scenarios) {
        project.scenarios.forEach((scenario) => scenarioIds.push(scenario.id));
      }

      const customProjectFeatures = await this.featuresRepo.find({
        where: { projectId },
      });
      const customProjectFeaturesIds = customProjectFeatures.map(
        (customFeature) => customFeature.id,
      );

      await this.projectRepo.delete(projectId);

      this.eventBus.publish(
        new ProjectDeleted(projectId, scenarioIds, customProjectFeaturesIds),
      );

      return right(true);
    } catch (error) {
      return left(deleteProjectFailed);
    }
  }
}
