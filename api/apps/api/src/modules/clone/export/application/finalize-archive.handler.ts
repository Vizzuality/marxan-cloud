import {
  CommandHandler,
  EventBus,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { isLeft } from 'fp-ts/Either';
import { isDefined } from '@marxan/utils';

import { FinalizeArchive } from './finalize-archive.command';
import { ExportRepository } from './export-repository.port';
import { ArchiveCreator } from './archive-creator.port';
import { ExportFailed } from '@marxan-api/modules/clone/export/application/export-failed.event';

@CommandHandler(FinalizeArchive)
export class FinalizeArchiveHandler
  implements IInferredCommandHandler<FinalizeArchive> {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly exportRepo: ExportRepository,
    private readonly archiveCreator: ArchiveCreator,
    private readonly eventPublisher: EventPublisher,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ exportId }: FinalizeArchive): Promise<void> {
    const exportInstance = await this.exportRepo.find(exportId);
    if (!exportInstance) {
      this.logger.error(
        `${FinalizeArchiveHandler.name} could not find export ${exportId.value} to complete archive.`,
      );

      return;
    }

    const pieces = exportInstance
      .toSnapshot()
      .exportPieces.flatMap((piece) => piece.uris)
      .filter(isDefined);

    const archiveResult = await this.archiveCreator.zip(
      pieces.map((piece) => ({
        uri: piece.uri,
        relativeDestination: piece.relativePath,
      })),
    );

    if (isLeft(archiveResult)) {
      this.logger.error(
        `${FinalizeArchiveHandler.name} could not create archive for ${exportId.value}.`,
      );
      this.eventBus.publish(
        new ExportFailed(
          exportId,
          exportInstance.resourceId,
          exportInstance.resourceKind,
          exportInstance.toSnapshot().archiveLocation,
        ),
      );
      return;
    }

    const exportAggregate = this.eventPublisher.mergeObjectContext(
      exportInstance,
    );

    const result = exportAggregate.complete(archiveResult.right);

    if (isLeft(result)) {
      this.logger.error(
        `${FinalizeArchiveHandler.name} tried to complete Export with archive but pieces were not ready.`,
      );
      this.eventBus.publish(
        new ExportFailed(
          exportId,
          exportInstance.resourceId,
          exportInstance.resourceKind,
          exportInstance.toSnapshot().archiveLocation,
        ),
      );
      return;
    }

    await this.exportRepo.save(exportAggregate);

    exportAggregate.commit();
  }
}
