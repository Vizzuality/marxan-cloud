import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { PlanningAreaCustomContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-custom';
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
export class PlanningAreaCustomPieceImporter implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlanningAreaCustomPieceImporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningAreaCustom && kind === ResourceKind.Project
    );
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, importResourceId, piece } = input;

    if (uris.length !== 1) {
      const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    const [planningAreaCustomLocation] = uris;

    const readableOrError = await this.fileRepository.get(
      planningAreaCustomLocation.uri,
    );
    if (isLeft(readableOrError)) {
      const errorMessage = `File with piece data for ${piece}/${importResourceId} is not available at ${planningAreaCustomLocation.uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const stringPlanningAreaCustomOrError = await extractFile(
      readableOrError.right,
      planningAreaCustomLocation.relativePath,
    );
    if (isLeft(stringPlanningAreaCustomOrError)) {
      const errorMessage = `Custom planning area file extraction failed: ${planningAreaCustomLocation.relativePath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const planningAreaGadm: PlanningAreaCustomContent = JSON.parse(
      stringPlanningAreaCustomOrError.right,
    );

    await this.geoprocessingEntityManager.transaction(async (em) => {
      await em.query(
        `
        INSERT INTO planning_areas(project_id, the_geom)
        VALUES ($1, ST_GeomFromEWKB($2))
      `,
        [importResourceId, Buffer.from(planningAreaGadm.planningAreaGeom)],
      );
      const [planningArea]: [{ id: string; bbox: number[] }] = await em.query(
        `
        SELECT id, bbox
        FROM planning_areas
        WHERE project_id = $1
      `,
        [importResourceId],
      );

      await this.apiEntityManager.query(
        `
        UPDATE projects
        SET
          planning_unit_grid_shape = $2,
          planning_unit_area_km2 = $3,
          bbox = $4,
          planning_area_geometry_id = $5
        WHERE id = $1
      `,
        [
          importResourceId,
          planningAreaGadm.puGridShape,
          planningAreaGadm.puAreaKm2,
          JSON.stringify(planningArea.bbox),
          planningArea.id,
        ],
      );
    });

    return {
      importId: input.importId,
      componentId: input.componentId,
      importResourceId,
      componentResourceId: input.componentResourceId,
      piece: input.piece,
    };
  }
}
