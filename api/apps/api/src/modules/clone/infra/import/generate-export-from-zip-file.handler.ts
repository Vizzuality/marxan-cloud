import { ArchiveLocation } from '@marxan/cloning/domain';
import {
  CloningFilesRepository,
  unknownError,
} from '@marxan/cloning-files-repository';
import { Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import {
  GenerateExportFromZipFile,
  GenerateExportFromZipFileError,
  invalidExportZipFile,
} from './generate-export-from-zip-file.command';
import { ExportId } from '../../export';

@CommandHandler(GenerateExportFromZipFile)
export class GenerateExportFromZipFileHandler
  implements IInferredCommandHandler<GenerateExportFromZipFile> {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(GenerateExportFromZipFileHandler.name);
  }

  async execute({
    file,
  }: GenerateExportFromZipFile): Promise<
    Either<GenerateExportFromZipFileError, ExportId>
  > {
    return left(unknownError);
    // const readable = Readable.from(file.buffer);
    // const uriOrError = await this.fileRepository.save(readable);

    // if (isLeft(uriOrError)) {
    //   return left(unknownError);
    // }

    // return right(new ArchiveLocation(uriOrError.right));
  }
}
