import { ArchiveLocation } from '@marxan/cloning/domain';
import {
  CloningFilesRepository,
  unknownError,
} from '@marxan/cloning-files-repository';
import { Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { UploadExportFile } from './upload-export-file.command';

@CommandHandler(UploadExportFile)
export class UploadExportFileHandler
  implements IInferredCommandHandler<UploadExportFile> {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(UploadExportFileHandler.name);
  }

  async execute({
    file,
  }: UploadExportFile): Promise<Either<typeof unknownError, ArchiveLocation>> {
    const readable = Readable.from(file.buffer);
    const uriOrError = await this.fileRepository.save(readable);

    if (isLeft(uriOrError)) {
      return left(unknownError);
    }

    return right(new ArchiveLocation(uriOrError.right));
  }
}
