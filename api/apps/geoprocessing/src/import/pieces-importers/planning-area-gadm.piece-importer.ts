import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { PlanningAreaGadmContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-gadm';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { readableToBuffer } from '@marxan/utils';
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
export class PlanningAreaGadmPieceImporter implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlanningAreaGadmPieceImporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningAreaGAdm && kind === ResourceKind.Project
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
      const [planningAreaGadmLocation] = uris;

      const readableOrError = await this.fileRepository.get(
        planningAreaGadmLocation.uri,
      );
      if (isLeft(readableOrError)) {
        const errorMessage = `File with piece data for ${piece}/${pieceResourceId} is not available at ${planningAreaGadmLocation.uri}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      const buffer = await readableToBuffer(readableOrError.right);
      const stringPlanningAreaGadmOrError = buffer.toString();

      const planningAreaGadm: PlanningAreaGadmContent = JSON.parse(
        stringPlanningAreaGadmOrError,
      );

      await this.entityManager
        .createQueryBuilder()
        .update(`projects`)
        .set({
          country_id: planningAreaGadm.country,
          admin_area_l1_id: planningAreaGadm.l1,
          admin_area_l2_id: planningAreaGadm.l2,
          planning_unit_area_km2: planningAreaGadm.planningUnitAreakm2,
          bbox: JSON.stringify(planningAreaGadm.bbox),
        })
        .where('id = :projectId', { projectId })
        .execute();
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
