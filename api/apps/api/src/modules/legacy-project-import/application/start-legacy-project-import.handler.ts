import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import {
  Project,
  ProjectSourcesEnum,
} from '@marxan-api/modules/projects/project.api.entity';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ResourceId } from '@marxan/cloning/domain';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { isLeft, right, left } from 'fp-ts/Either';
import { Repository } from 'typeorm';
import { LegacyProjectImport } from '../domain/legacy-project-import/legacy-project-import';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import {
  createShellsFailed,
  StartLegacyProjectImport,
  StartLegacyProjectImportResponse,
} from './start-legacy-project-import.command';

@CommandHandler(StartLegacyProjectImport)
export class StartLegacyProjectImportHandler
  implements IInferredCommandHandler<StartLegacyProjectImport> {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    private readonly legacyProjectImportRepository: LegacyProjectImportRepository,
  ) {}

  private async createShells(
    name: string,
    ownerId: string,
    description?: string,
  ) {
    try {
      const [randomOrganization] = await this.organizationRepo.find({
        take: 1,
      });
      if (!randomOrganization)
        throw new Error('cant find an existing organization');

      const randomOrganizationId = randomOrganization.id;

      const project = await this.projectRepo.save({
        name,
        organizationId: randomOrganizationId,
        sources: ProjectSourcesEnum.legacyImport,
        createdBy: ownerId,
        description,
      });

      const scenarioName = name + ' - scenario';
      const scenario = await this.scenarioRepo.save({
        name: scenarioName,
        projectId: project.id,
      });

      return right({
        projectId: new ResourceId(project.id),
        scenarioId: new ResourceId(scenario.id),
      });
    } catch (error) {
      return left(createShellsFailed);
    }
  }

  async execute({
    name,
    ownerId,
    description,
  }: StartLegacyProjectImport): Promise<StartLegacyProjectImportResponse> {
    const shellsOrError = await this.createShells(
      name,
      ownerId.value,
      description,
    );

    if (isLeft(shellsOrError)) return shellsOrError;

    const { projectId, scenarioId } = shellsOrError.right;

    const legacyProjectImport = LegacyProjectImport.newOne(
      projectId,
      scenarioId,
      ownerId,
    );

    const legacyProjectImportSavedOrError = await this.legacyProjectImportRepository.save(
      legacyProjectImport,
    );

    if (isLeft(legacyProjectImportSavedOrError))
      return legacyProjectImportSavedOrError;

    return right({ projectId, scenarioId });
  }
}
