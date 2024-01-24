import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersProjectsApiEntity } from '../access-control/projects-acl/entity/users-projects.api.entity';
import { UsersScenariosApiEntity } from '../access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { AsyncJobsGarbageCollectorFinished } from './async-jobs-garbage-collector-finished.event';
import { GarbageCollectAsyncJobs } from './garbage-collect-async-jobs.command';
import { ProjectAsyncJobsGarbageCollector } from './project-async-jobs.garbage-collector';
import { ScenarioAsyncJobsGarbageCollector } from './scenario-async-jobs.garbage-collector';

@CommandHandler(GarbageCollectAsyncJobs)
export class GarbageCollectAsyncJobsHandler
  implements IInferredCommandHandler<GarbageCollectAsyncJobs>
{
  constructor(
    @InjectRepository(UsersProjectsApiEntity)
    private readonly usersProjectsRepo: Repository<UsersProjectsApiEntity>,
    @InjectRepository(UsersScenariosApiEntity)
    private readonly usersScenariosRepo: Repository<UsersScenariosApiEntity>,
    private readonly projectAsyncJobs: ProjectAsyncJobsGarbageCollector,
    private readonly scenarioAsyncJobs: ScenarioAsyncJobsGarbageCollector,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ userId }: GarbageCollectAsyncJobs) {
    const projectsIds = await this.getProjectsIdsOf(userId);
    for (const projectId of projectsIds) {
      await this.projectAsyncJobs.sendFailedApiEventsForStuckAsyncJobs(
        projectId,
      );
    }

    const scenariosIds = await this.getScenariosIdsOf(userId);
    for (const scenarioId of scenariosIds) {
      await this.scenarioAsyncJobs.sendFailedApiEventsForStuckAsyncJobs(
        scenarioId,
      );
    }

    this.eventBus.publish(new AsyncJobsGarbageCollectorFinished(userId));
  }

  private async getProjectsIdsOf(userId: string) {
    const userProjects = await this.usersProjectsRepo.find({
      where: { userId },
    });
    return userProjects.map(({ projectId }) => projectId);
  }

  private async getScenariosIdsOf(userId: string) {
    const userScenarios = await this.usersScenariosRepo.find({
      where: { userId },
    });
    return userScenarios.map(({ scenarioId }) => scenarioId);
  }
}
