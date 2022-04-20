import {
  ArchiveLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { Repository } from 'typeorm';
import { Scenario } from '../../../scenarios/scenario.api.entity';
import { ExportRepository } from '../../export/application/export-repository.port';
import { Import } from '../domain/import/import';
import {
  exportNotFound,
  invalidProjectExport,
  unfinishedExport,
} from './import-project.command';
import { ImportResourcePieces } from './import-resource-pieces.port';
import {
  ImportScenario,
  ImportScenarioCommandResult,
  ImportScenarioError,
  scenarioShellNotFound,
} from './import-scenario.command';
import { ImportRepository } from './import.repository.port';

@CommandHandler(ImportScenario)
export class ImportScenarioHandler
  implements IInferredCommandHandler<ImportScenario> {
  constructor(
    private readonly exportRepo: ExportRepository,
    @InjectRepository(Scenario)
    private readonly scenarioRepo: Repository<Scenario>,
    private readonly importRepo: ImportRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly importResourcePieces: ImportResourcePieces,
  ) {}

  async execute({
    exportId,
    ownerId,
    importResourceId,
  }: ImportScenario): Promise<
    Either<ImportScenarioError, ImportScenarioCommandResult>
  > {
    const scenario = await this.scenarioRepo.findOne(importResourceId.value);

    if (!scenario) {
      return left(scenarioShellNotFound);
    }

    const exportInstance = await this.exportRepo.find(exportId);

    if (!exportInstance) {
      return left(exportNotFound);
    }

    if (!exportInstance.toSnapshot().archiveLocation) {
      return left(unfinishedExport);
    }

    if (exportInstance.resourceKind !== ResourceKind.Scenario) {
      return left(invalidProjectExport);
    }

    const isCloning = true;

    const pieces = this.importResourcePieces.resolveForScenario(
      importResourceId,
      exportInstance.toSnapshot().exportPieces,
    );
    const archiveLocation = new ArchiveLocation(
      exportInstance.toSnapshot().archiveLocation!,
    );

    const importRequest = this.eventPublisher.mergeObjectContext(
      Import.newOne(
        importResourceId,
        ResourceKind.Scenario,
        new ResourceId(scenario.projectId),
        ownerId,
        archiveLocation,
        pieces,
        isCloning,
      ),
    );

    importRequest.run();

    const result = await this.importRepo.save(importRequest);

    if (isLeft(result)) return result;

    importRequest.commit();

    return right({
      importId: importRequest.importId.value,
      scenarioId: importResourceId.value,
    });
  }
}
