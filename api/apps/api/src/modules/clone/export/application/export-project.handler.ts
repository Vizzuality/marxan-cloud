import { ResourceKind } from '@marxan/cloning/domain';
import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../../projects/project.api.entity';
import { Export } from '../domain';
import {
  ExportProject,
  ExportProjectCommandResult,
} from './export-project.command';
import { ExportRepository } from './export-repository.port';
import { ExportResourcePieces } from './export-resource-pieces.port';

@CommandHandler(ExportProject)
export class ExportProjectHandler
  implements IInferredCommandHandler<ExportProject> {
  constructor(
    private readonly resourcePieces: ExportResourcePieces,
    private readonly exportRepository: ExportRepository,
    private readonly eventPublisher: EventPublisher,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  private async createProjectShell(
    existingProjectId: string,
    newProjectId: string,
  ) {
    const project = await this.projectRepo.findOneOrFail(existingProjectId);
    await this.projectRepo.save({
      id: newProjectId,
      name: project.name + ' - copy',
      organizationId: project.organizationId,
    });
  }

  async execute({
    id,
    scenarioIds,
    ownerId,
    cloning,
  }: ExportProject): Promise<ExportProjectCommandResult> {
    const kind = ResourceKind.Project;
    const pieces = await this.resourcePieces.resolveForProject(id, scenarioIds);
    const exportRequest = this.eventPublisher.mergeObjectContext(
      Export.newOne(id, kind, ownerId, pieces, cloning),
    );
    await this.exportRepository.save(exportRequest);

    exportRequest.commit();

    if (cloning) {
      await this.createProjectShell(
        id.value,
        exportRequest.importResourceId!.value,
      );
    }

    return {
      exportId: exportRequest.id,
      importResourceId: exportRequest.importResourceId,
    };
  }
}
