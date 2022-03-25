import { projectTableName } from '@marxan-api/modules/projects/project.api.entity';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { PlanningAreaCustomContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-custom';
import { FileRepository } from '@marxan/files-repository';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
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
      const geoQb = em.createQueryBuilder();
      const planningAreaGeom = Buffer.from(
        planningAreaGadm.planningAreaGeom,
      ).toString('hex');

      const result = await geoQb
        .insert()
        .into(PlanningArea)
        .values({
          projectId: importResourceId,
          theGeom: () => `'${planningAreaGeom}'`,
        })
        .returning(['id', 'bbox'])
        .execute();

      const [planningArea] = result.raw as [{ id: string; bbox: number[] }];

      await this.apiEntityManager
        .createQueryBuilder()
        .update(projectTableName)
        .set({
          planning_unit_area_km2: planningAreaGadm.puAreaKm2,
          bbox: JSON.stringify(planningArea.bbox),
          planning_area_geometry_id: planningArea.id,
        })
        .where('id = :importResourceId', { importResourceId })
        .execute();
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
