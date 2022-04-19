import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ComponentLocation } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  MarxanExecutionMetadataFolderType,
  getMarxanExecutionMetadataFolderRelativePath,
  MarxanExecutionMetadataContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/marxan-execution-metadata';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { isDefined } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

type FolderZipData = {
  id: string;
  type: MarxanExecutionMetadataFolderType;
  buffer: Buffer;
};

@Injectable()
@PieceExportProvider()
export class MarxanExecutionMetadataPieceExporter
  implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(MarxanExecutionMetadataPieceExporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.MarxanExecutionMetadata;
  }

  private async saveZipFile(
    file: Buffer,
    executionId: string,
    type: MarxanExecutionMetadataFolderType,
  ): Promise<string> {
    const locationOrError = await this.fileRepository.save(Readable.from(file));
    if (isLeft(locationOrError)) {
      const errorMessage = `${MarxanExecutionMetadataPieceExporter.name} - couldn't save ${type} folder file for execution with id ${executionId} - ${locationOrError.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return locationOrError.right;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const marxanExecutionMetadataWithBuffers = await this.entityManager
      .getRepository(MarxanExecutionMetadataGeoEntity)
      .find({ where: { scenarioId: input.resourceId } });

    const fileContent: MarxanExecutionMetadataContent = {
      marxanExecutionMetadata: marxanExecutionMetadataWithBuffers.map(
        (metadata) => ({
          id: metadata.id,
          failed: metadata.failed,
          stdError: metadata.stdError,
          stdOutput: metadata.stdOutput,
          includesOutputFolder: isDefined(metadata.outputZip),
        }),
      ),
    };
    const foldersZipsData: FolderZipData[] = marxanExecutionMetadataWithBuffers.flatMap(
      ({ id, inputZip, outputZip }) => {
        const files: FolderZipData[] = [
          { id, buffer: inputZip, type: 'input' },
        ];
        if (outputZip) files.push({ id, buffer: outputZip, type: 'output' });

        return files;
      },
    );

    const jsonFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(fileContent)),
      `json`,
    );

    if (isLeft(jsonFile)) {
      const errorMessage = `${MarxanExecutionMetadataPieceExporter.name} - couldn't save file - ${jsonFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const [jsonFileLocation] = ClonePieceUrisResolver.resolveFor(
      ClonePiece.MarxanExecutionMetadata,
      jsonFile.right,
      {
        kind: input.resourceKind,
        scenarioId: input.resourceId,
      },
    );

    const folderZipsLocations = await Promise.all(
      foldersZipsData.map(async ({ buffer, id, type }) => {
        const location = await this.saveZipFile(buffer, id, type);
        const relativePath = getMarxanExecutionMetadataFolderRelativePath(
          id,
          type,
          jsonFileLocation.relativePath,
        );

        return new ComponentLocation(location, relativePath);
      }),
    );

    return {
      ...input,
      uris: [jsonFileLocation, ...folderZipsLocations],
    };
  }
}
