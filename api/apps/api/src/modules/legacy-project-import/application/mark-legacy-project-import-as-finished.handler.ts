import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceId } from '@marxan/cloning/domain';
import { Logger } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Repository } from 'typeorm';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import { MarkLegacyProjectImportAsFailed } from './mark-legacy-project-import-as-failed.command';
import { MarkLegacyProjectImportAsFinished } from './mark-legacy-project-import-as-finished.command';

@CommandHandler(MarkLegacyProjectImportAsFinished)
export class MarkLegacyProjectImportAsFinishedHandler
  implements IInferredCommandHandler<MarkLegacyProjectImportAsFinished> {
  constructor(
    private readonly apiEvents: ApiEventsService,
    private readonly legacyProjectImportRepository: LegacyProjectImportRepository,
    private readonly commandBus: CommandBus,
    @InjectRepository(UsersProjectsApiEntity)
    private readonly usersRepo: Repository<UsersProjectsApiEntity>,
    @InjectRepository(Scenario)
    private readonly scenariosRepo: Repository<Scenario>,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(MarkLegacyProjectImportAsFinishedHandler.name);
  }

  private async markLegacyProjectImportAsFailed(
    projectId: ResourceId,
    reason: string,
  ): Promise<void> {
    this.logger.error(reason);
    await this.commandBus.execute(
      new MarkLegacyProjectImportAsFailed(projectId, reason),
    );
  }

  private async updateScenarioMetadataOfLegacyProjectImport(
    projectId: ResourceId,
    scenarioId: string,
  ) {
    const [scenario] = await this.scenariosRepo.find({ id: scenarioId });

    if (!scenario) {
      const reason = 'could not find scenario';
      return this.markLegacyProjectImportAsFailed(projectId, reason);
    }

    const scenarioMetadata = scenario.metadata;

    if (!scenarioMetadata || !scenarioMetadata.scenarioEditingMetadata) {
      const reason = 'input.dat file should have updated scenario metadata';
      return this.markLegacyProjectImportAsFailed(projectId, reason);
    }
    const updatedScenarioMetadata = {
      ...scenarioMetadata,
      scenarioEditingMetadata: {
        ...scenarioMetadata.scenarioEditingMetadata,
        lastJobCheck: new Date().getTime(),
      },
    };

    await this.scenariosRepo.save({
      id: scenarioId,
      metadata: updatedScenarioMetadata,
    });
  }

  async execute({
    projectId,
  }: MarkLegacyProjectImportAsFinished): Promise<void> {
    const legacyProjectImport = await this.legacyProjectImportRepository.find(
      projectId,
    );

    if (isLeft(legacyProjectImport)) {
      await this.markLegacyProjectImportAsFailed(
        projectId,
        `Legacy project import for project with ID ${projectId.value} not found. Legacy project import cannot be marked as finished`,
      );
      return;
    }
    const { ownerId, scenarioId } = legacyProjectImport.right.toSnapshot();
    const kind = API_EVENT_KINDS.project__legacy__import__finished__v1__alpha;
    const topic = projectId.value;

    await this.updateScenarioMetadataOfLegacyProjectImport(
      projectId,
      scenarioId,
    );

    await this.apiEvents.createIfNotExists({
      kind,
      topic,
      data: {
        projectId: topic,
        scenarioId,
        ownerId,
      },
    });

    await this.usersRepo.save({
      userId: ownerId,
      projectId: projectId.value,
      roleName: ProjectRoles.project_owner,
    });
  }
}
