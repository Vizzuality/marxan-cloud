import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ProjectMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-metadata';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { readableToBuffer } from '@marxan/utils';
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
  private readonly logger: Logger = new Logger(
    ProjectMetadataPieceImporter.name,
  );

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {}

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

  private async createProject(
    em: EntityManager,
    projectId: string,
    organizationId: string,
    data: ProjectMetadataContent,
    ownerId: string,
    resourceName?: string,
  ) {
    await em
      .createQueryBuilder()
      .insert()
      .into(`projects`)
      .values({
        id: projectId,
        name: resourceName ?? data.name + ' - copy',
        description: data.description,
        organization_id: organizationId,
        planning_unit_grid_shape: data.planningUnitGridShape,
        metadata: data.metadata,
        created_by: ownerId,
        sources: data.sources,
      })
      .execute();

    await em
      .createQueryBuilder()
      .insert()
      .into(`users_projects`)
      .values({
        user_id: ownerId,
        project_id: projectId,
        // It would be great to use ProjectRoles enum instead of having
        // the role hardcoded. The thing is that Geoprocessing code shouldn't depend
        // directly on elements of Api code, so there were two options:
        // - Move ProjectRoles enum to libs package
        // - Harcode the rol
        // We took the second approach because we are only referencing values from that enum
        // here
        role_id: 'project_owner',
      })
      .execute();
  }

  private updateProject(
    em: EntityManager,
    projectId: string,
    data: ProjectMetadataContent,
    ownerId: string,
  ) {
    return em
      .createQueryBuilder()
      .update('projects')
      .set({
        description: data.description,
        planning_unit_grid_shape: data.planningUnitGridShape,
        metadata: data.metadata,
        created_by: ownerId,
        sources: data.sources,
      })
      .where('id = :projectId', { projectId })
      .execute();
  }

  private async checkIfProjectExists(em: EntityManager, projectId: string) {
    const [project]: [{ id: string }] = await em
      .createQueryBuilder()
      .select('id')
      .from('projects', 'p')
      .where('id = :projectId', { projectId })
      .execute();

    return Boolean(project);
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const {
      uris,
      pieceResourceId,
      projectId,
      piece,
      ownerId,
      resourceName,
    } = input;

    try {
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
        const errorMessage = `File with piece data for ${piece}/${pieceResourceId} is not available at ${projectMetadataLocation.uri}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      const buffer = await readableToBuffer(readableOrError.right);
      const stringProjectMetadataOrError = buffer.toString();

      // TODO As we don't handle organizations for the time being,
      // the imported/cloned project is homed arbitrarily within an
      // existing organization. Once proper handling of organizations
      // is added, users may be able to specify within which organization
      // an imported/cloned project should be created.
      const organizationId = await this.getRandomOrganizationId();
      const projectMetadata: ProjectMetadataContent = JSON.parse(
        stringProjectMetadataOrError,
      );

      await this.entityManager.transaction(async (em) => {
        const projectAlreadyCreated = await this.checkIfProjectExists(
          em,
          projectId,
        );
        if (projectAlreadyCreated) {
          await this.updateProject(em, projectId, projectMetadata, ownerId);
        } else {
          await this.createProject(
            em,
            projectId,
            organizationId,
            projectMetadata,
            ownerId,
            resourceName,
          );
        }

        await em
          .createQueryBuilder()
          .insert()
          .into('project_blms')
          .values({ id: projectId, ...projectMetadata.blmRange })
          .execute();

        if (projectMetadata?.outputSummaryZip) {
          await em
            .createQueryBuilder()
            .insert()
            .into('output_project_summaries')
            .values({
              project_id: projectId,
              summary_zipped_data: Buffer.from(
                projectMetadata.outputSummaryZip,
                'base64',
              ),
            })
            .execute();
        } else {
          this.logger.log(
            `No output summary data for project ${projectId}: the source project may not have any scenarios run yet.`,
          );
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId,
      projectId,
      piece: input.piece,
    };
  }
}
