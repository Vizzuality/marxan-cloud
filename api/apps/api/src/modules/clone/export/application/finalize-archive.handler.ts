import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { FinalizeArchive } from './finalize-archive.command';
import { ExportRepository } from './export-repository.port';
import { ArchiveCreator } from './archive-creator.port';

@CommandHandler(FinalizeArchive)
export class FinalizeArchiveHandler
  implements IInferredCommandHandler<FinalizeArchive> {
  constructor(
    private readonly exportRepo: ExportRepository,
    private readonly archiveCreator: ArchiveCreator,
  ) {}

  execute({ exportId }: FinalizeArchive): Promise<void> {
    // make JobOutput return {uri:..., relativeDest: ...}[]
    // and also modify ExportComponent to include those :grim:

    // get ExportInstance
    // get uri's
    // compose archive out of parts

    // .complete on aggregate

    console.log(`finalize archive`);

    return Promise.resolve(undefined);
  }
}
