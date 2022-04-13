import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { ScenarioExportConfigContent } from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, isLeft, right } from 'fp-ts/Either';
import { Import } from '../domain/import/import';
import { ExportConfigReader } from './export-config-reader';
import { ImportResourcePieces } from './import-resource-pieces.port';
import {
  ImportScenario,
  ImportScenarioCommandResult,
  ImportScenarioError,
} from './import-scenario.command';
import { ImportRepository } from './import.repository.port';

@CommandHandler(ImportScenario)
export class ImportScenarioHandler
  implements IInferredCommandHandler<ImportScenario> {
  constructor(
    private readonly exportConfigReader: ExportConfigReader,
    private readonly importRepo: ImportRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly importResourcePieces: ImportResourcePieces,
  ) {}

  async execute({
    archiveLocation,
    ownerId,
    importResourceId,
  }: ImportScenario): Promise<
    Either<ImportScenarioError, ImportScenarioCommandResult>
  > {
    const exportConfigOrError = await this.exportConfigReader.read(
      archiveLocation,
    );
    if (isLeft(exportConfigOrError)) return exportConfigOrError;

    const isCloning = true;
    const exportConfig = exportConfigOrError.right as ScenarioExportConfigContent;

    const pieces = this.importResourcePieces.resolveForScenario(
      importResourceId,
      archiveLocation,
      exportConfig.pieces,
      ResourceKind.Scenario,
      exportConfig.resourceId,
    );

    const importRequest = this.eventPublisher.mergeObjectContext(
      Import.newOne(
        importResourceId,
        ResourceKind.Scenario,
        new ResourceId(exportConfig.projectId),
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
