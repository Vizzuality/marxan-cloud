import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ProjectMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-metadata';
import { FileRepository } from '@marxan/files-repository';
import { extractFile } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm';
import { ResourceKind } from '@marxan/cloning/domain';
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

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.ProjectMetadata && kind === ResourceKind.Project
    );
  }

  private async getRandomOrganizationId(): Promise<string> {
    const [{ id }]: [{ id: string }] = await this.entityManager.query(`
      SELECT id FROM organizations LIMIT 1
    `);
    return id;
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, importResourceId, piece } = input;

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
      const errorMessage = `File with piece data for ${piece}/${importResourceId} is not available at ${projectMetadataLocation.uri}`;
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

    // TODO As we don't handle organizations for the time being,
    // the imported/cloned project is homed arbitrarily within an
    // existing organization. Once proper handling of organizations
    // is added, users may be able to specify within which organization
    // an imported/cloned project should be created.
    const organizationId = await this.getRandomOrganizationId();
    const projectMetadata: ProjectMetadataContent = JSON.parse(
      stringProjectMetadataOrError.right,
    );

    await this.entityManager
      .createQueryBuilder()
      .insert()
      .into(`projects`)
      .values({
        id: importResourceId,
        name: projectMetadata.name,
        description: projectMetadata.description,
        organization_id: organizationId,
        planning_unit_grid_shape: projectMetadata.planningUnitGridShape,
      })
      .execute();

    return {
      importId: input.importId,
      componentId: input.componentId,
      importResourceId,
      componentResourceId: input.componentResourceId,
      piece: input.piece,
    };
  }
}
