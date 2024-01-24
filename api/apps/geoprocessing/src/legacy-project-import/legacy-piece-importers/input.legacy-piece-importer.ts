import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm';
import {
  LegacyProjectImportPieceProcessor,
  LegacyProjectImportPieceProcessorProvider,
} from '../pieces/legacy-project-import-piece-processor';
import {
  InputDatReader,
  invalidInputDatFileVariables,
  readInputDatFileFails,
} from './file-readers/input-dat.reader';

@Injectable()
@LegacyProjectImportPieceProcessorProvider()
export class InputLegacyProjectPieceImporter
  implements LegacyProjectImportPieceProcessor
{
  private readonly logger: Logger = new Logger(
    InputLegacyProjectPieceImporter.name,
  );

  constructor(
    private readonly filesRepo: LegacyProjectImportFilesRepository,
    private readonly inputDatReader: InputDatReader,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
  ) {}

  isSupported(piece: LegacyProjectImportPiece): boolean {
    return piece === LegacyProjectImportPiece.Input;
  }

  async run(
    input: LegacyProjectImportJobInput,
  ): Promise<LegacyProjectImportJobOutput> {
    const { files, scenarioId } = input;

    const inputDatFileOrError = files.find(
      (file) => file.type === LegacyProjectImportFileType.InputDat,
    );

    if (!inputDatFileOrError)
      throw new Error('input.dat file was not found inside input file array');

    const inputDatReadableOrError = await this.filesRepo.get(
      inputDatFileOrError.location,
    );

    if (isLeft(inputDatReadableOrError))
      throw new Error('input.dat file was not found in files repo');

    const marxanInputParametersOrError = await this.inputDatReader.readFile(
      inputDatReadableOrError.right,
    );

    if (isLeft(marxanInputParametersOrError)) {
      switch (marxanInputParametersOrError.left) {
        case readInputDatFileFails:
          throw new Error("server can't read input.dat file");
        case invalidInputDatFileVariables:
          throw new Error('invalid variables values in input.dat file');
      }
    }

    const marxanInputParameters = marxanInputParametersOrError.right;

    const legacyProjectImportIncludesSolutions = files.some(
      (file) => file.type === LegacyProjectImportFileType.Output,
    );

    const scenarioMetadata = {
      scenarioEditingMetadata: {
        tab: legacyProjectImportIncludesSolutions ? 'solutions' : 'parameters',
        subtab: null,
        status: {
          'planning-unit': 'draft',
          features: 'draft',
          parameters: 'draft',
          solutions: legacyProjectImportIncludesSolutions ? 'draft' : 'empty',
        },
        lastJobCheck: new Date().getTime(),
      },
      marxanInputParameterFile: marxanInputParameters,
    };

    await this.apiEntityManager
      .createQueryBuilder()
      .update('scenarios', {
        metadata: JSON.stringify(scenarioMetadata),
      })
      .where('id = :scenarioId', { scenarioId })
      .execute();

    return {
      ...input,
    };
  }
}
