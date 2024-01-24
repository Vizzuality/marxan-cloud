import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentLocation } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { IncomingMessage } from 'http';
import { EntityManager } from 'typeorm';
import { AppConfig } from '../../utils/config.utils';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';
import { lastValueFrom } from 'rxjs';

type SelectScenarioResult = {
  name: string;
};

@Injectable()
@PieceExportProvider()
export class ScenarioOutputFolderPieceExporter implements ExportPieceProcessor {
  private readonly logger: Logger = new Logger(
    ScenarioOutputFolderPieceExporter.name,
  );

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
    private readonly httpService: HttpService,
  ) {}

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioOutputFolder;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const [scenario]: [SelectScenarioResult] = await this.entityManager
      .createQueryBuilder()
      .select('name')
      .from('scenarios', 's')
      .where('s.id = :scenarioId', { scenarioId: input.resourceId })
      .execute();

    if (!scenario) {
      const errorMessage = `${ScenarioOutputFolderPieceExporter.name} - Scenario ${input.resourceId} does not exist.`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const response = this.httpService.get<IncomingMessage>(
      `${AppConfig.get<string>('api.url')}/api/v1/marxan-run/scenarios/${
        input.resourceId
      }/marxan/output`,
      {
        headers: {
          'x-api-key': AppConfig.get<string>('auth.xApiKey.secret'),
        },
        responseType: 'stream',
        validateStatus: (status) =>
          status === HttpStatus.OK || status === HttpStatus.NOT_FOUND,
      },
    );

    const { status, data } = await lastValueFrom(response);

    if (status === HttpStatus.NOT_FOUND) {
      return {
        ...input,
        uris: [],
      };
    }

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ScenarioOutputFolder,
      {
        kind: input.resourceKind,
        scenarioId: input.resourceId,
        scenarioName: scenario.name,
      },
    );

    const outputFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      data,
      relativePath,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ScenarioOutputFolderPieceExporter.name} - Scenario - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: [new ComponentLocation(outputFile.right, relativePath)],
    };
  }
}
