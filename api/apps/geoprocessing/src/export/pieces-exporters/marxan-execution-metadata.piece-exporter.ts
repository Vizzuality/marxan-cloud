import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentLocation } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  getMarxanExecutionMetadataFolderRelativePath,
  MarxanExecutionMetadataContent,
  MarxanExecutionMetadataFolderType,
} from '@marxan/cloning/infrastructure/clone-piece-data/marxan-execution-metadata';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { isDefined } from '@marxan/utils';
import { Injectable, ConsoleLogger } from '@nestjs/common';
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
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext(MarxanExecutionMetadataPieceExporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.MarxanExecutionMetadata;
  }

  private async saveZipFile(
    file: Buffer,
    exportId: string,
    relativePath: string,
  ): Promise<string> {
    const locationOrError = await this.fileRepository.saveCloningFile(
      exportId,
      Readable.from(file),
      relativePath,
    );
    if (isLeft(locationOrError)) {
      const errorMessage = `${MarxanExecutionMetadataPieceExporter.name} - couldn't save execution metadata folder zip file - ${locationOrError.left.description}`;
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

    const jsonFileRelativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.MarxanExecutionMetadata,
      {
        kind: input.resourceKind,
        scenarioId: input.resourceId,
      },
    );

    const jsonFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(JSON.stringify(fileContent)),
      jsonFileRelativePath,
    );

    if (isLeft(jsonFile)) {
      const errorMessage = `${MarxanExecutionMetadataPieceExporter.name} - couldn't save file - ${jsonFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const folderZipsLocations = await Promise.all(
      foldersZipsData.map(async ({ buffer, id, type }) => {
        const relativePath = getMarxanExecutionMetadataFolderRelativePath(
          id,
          type,
          jsonFileRelativePath,
        );
        const location = await this.saveZipFile(
          buffer,
          input.exportId,
          relativePath,
        );

        return new ComponentLocation(location, relativePath);
      }),
    );

    return {
      ...input,
      uris: [
        new ComponentLocation(jsonFile.right, jsonFileRelativePath),
        ...folderZipsLocations,
      ],
    };
  }
}
