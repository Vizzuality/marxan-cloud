import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ProjectMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-metadata';
import { FileRepository } from '@marxan/files-repository';
import { extractFile } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

@Injectable()
@PieceImportProvider()
export class ProjectMetadataPieceImporter implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ProjectMetadataPieceImporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ProjectMetadata;
  }

  private async getRandomOrganizationId(): Promise<string> {
    const [{ id }]: [{ id: string }] = await this.entityManager.query(`
      SELECT id FROM organizations LIMIT 1
    `);
    return id;
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, resourceId } = input;

    if (uris.length !== 1) {
      const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    const [projectMetadataLocation] = uris;

    const readableOrError = await this.fileRepository.get(
      projectMetadataLocation.uri,
    );
    if (isLeft(readableOrError)) {
      const errorMessage = `Zip file not found: ${projectMetadataLocation.uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const stringProjectMetadataOrError = await extractFile(
      readableOrError.right,
      projectMetadataLocation.relativePath,
    );
    if (isLeft(stringProjectMetadataOrError)) {
      const errorMessage = `Project metadata file extraction failed: ${projectMetadataLocation.relativePath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // TODO OrganizationId should be specified when creating the Import
    const organizationId = await this.getRandomOrganizationId();
    const projectMetadata: ProjectMetadataContent = JSON.parse(
      stringProjectMetadataOrError.right,
    );

    await this.entityManager.query(
      `
      INSERT INTO projects(id, name, description, organization_id)
      VALUES ($1, $2, $3, $4)
    `,
      [
        resourceId,
        projectMetadata.name,
        projectMetadata.description,
        organizationId,
      ],
    );

    return {
      importId: input.importId,
      componentId: input.componentId,
      resourceId: input.resourceId,
      piece: input.piece,
    };
  }
}
