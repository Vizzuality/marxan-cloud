import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { isLeft } from 'fp-ts/Either';
import { isDefined } from '@marxan/utils';

import { FinalizeArchive } from './finalize-archive.command';
import { ExportRepository } from './export-repository.port';
import { ArchiveCreator } from './archive-creator.port';

@CommandHandler(FinalizeArchive)
export class FinalizeArchiveHandler
  implements IInferredCommandHandler<FinalizeArchive> {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly exportRepo: ExportRepository,
    private readonly archiveCreator: ArchiveCreator,
    private readonly eventPublisher: EventPublisher,
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
      .exportPieces.flatMap((piece) => piece.uri)
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
      return;
    }

    await this.exportRepo.save(exportAggregate);

    exportAggregate.commit();
  }
}
