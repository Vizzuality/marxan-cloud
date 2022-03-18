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
import { ImportScenario, ImportScenarioError } from './import-scenario.command';
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
  }: ImportScenario): Promise<Either<ImportScenarioError, string>> {
    const exportConfigOrError = await this.exportConfigReader.read(
      archiveLocation,
    );
    if (isLeft(exportConfigOrError)) return exportConfigOrError;

    const exportConfig = exportConfigOrError.right as ScenarioExportConfigContent;
    const resourceId = ResourceId.create();

    const pieces = this.importResourcePieces.resolveForScenario(
      resourceId,
      archiveLocation,
      exportConfig.pieces,
      ResourceKind.Scenario,
      exportConfig.resourceId,
    );
    const importResourceId = new ResourceId(exportConfig.projectId);

    const importRequest = this.eventPublisher.mergeObjectContext(
      Import.newOne(
        importResourceId,
        ResourceKind.Scenario,
        archiveLocation,
        pieces,
      ),
    );

    importRequest.run();

    const result = await this.importRepo.save(importRequest);

    if (isLeft(result)) return result;

    importRequest.commit();

    return right(importRequest.importId.value);
  }
}
