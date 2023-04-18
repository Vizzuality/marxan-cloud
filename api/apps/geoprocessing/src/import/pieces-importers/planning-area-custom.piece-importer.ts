import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { PlanningAreaCustomContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-custom';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { readableToBuffer } from '@marxan/utils';
import { Injectable, ConsoleLogger } from '@nestjs/common';
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
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext(PlanningAreaCustomPieceImporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningAreaCustom && kind === ResourceKind.Project
    );
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, pieceResourceId, projectId, piece } = input;

    try {
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
        const errorMessage = `File with piece data for ${piece}/${pieceResourceId} is not available at ${planningAreaCustomLocation.uri}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      const buffer = await readableToBuffer(readableOrError.right);
      const stringPlanningAreaCustom = buffer.toString();

      const planningAreaGadm: PlanningAreaCustomContent = JSON.parse(
        stringPlanningAreaCustom,
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
            projectId,
            theGeom: () => `'${planningAreaGeom}'`,
          })
          .returning(['id', 'bbox'])
          .execute();

        const [planningArea] = result.raw as [{ id: string; bbox: number[] }];

        await this.apiEntityManager
          .createQueryBuilder()
          .update(`projects`)
          .set({
            planning_unit_area_km2: planningAreaGadm.puAreaKm2,
            bbox: JSON.stringify(planningArea.bbox),
            planning_area_geometry_id: planningArea.id,
          })
          .where('id = :projectId', { projectId })
          .execute();
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
