import {
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/These';
import { EntityManager } from 'typeorm';
import { geoprocessingConnections } from '../../ormconfig';
import {
  LegacyProjectImportPieceProcessor,
  LegacyProjectImportPieceProcessorProvider,
} from '../pieces/legacy-project-import-piece-processor';
import { PuDatReader } from './file-readers/pu-dat.reader';

@Injectable()
@LegacyProjectImportPieceProcessorProvider()
export class ScenarioPusDataLegacyProjectPieceImporter
  implements LegacyProjectImportPieceProcessor {
  constructor(
    private readonly filesRepo: LegacyProjectImportFilesRepository,
    private readonly puDatReader: PuDatReader,
    @InjectEntityManager(geoprocessingConnections.default.name)
    private readonly geoEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioPusDataLegacyProjectPieceImporter.name);
  }

  isSupported(piece: LegacyProjectImportPiece): boolean {
    return piece === LegacyProjectImportPiece.ScenarioPusData;
  }

  private logAndThrow(message: string): never {
    this.logger.error(message);
    throw new Error(message);
  }

  async run(
    input: LegacyProjectImportJobInput,
  ): Promise<LegacyProjectImportJobOutput> {
    const puDatFile = input.files.find(
      (file) => file.type === LegacyProjectImportFileType.PuDat,
    );

    if (!puDatFile) {
      this.logAndThrow('pu.dat file not found inside input files array');
    }

    const readable = await this.filesRepo.get(puDatFile.location);
    if (isLeft(readable)) {
      this.logAndThrow(
        'pu.dat file not found in LegacyProjectImportFilesRepository',
      );
    }

    const rowsOrError = await this.puDatReader.readFile(readable.right);
    if (isLeft(rowsOrError)) {
      this.logAndThrow(rowsOrError.left);
    }

    console.log(rowsOrError.right);

    return input;
  }
}
