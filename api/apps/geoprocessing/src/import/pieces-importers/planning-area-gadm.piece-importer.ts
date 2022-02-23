import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { PlanningAreaGadmContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-gadm';
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
export class PlanningAreaGadmPieceImporter implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
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
    const { uris, importResourceId, piece } = input;

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
      const errorMessage = `File with piece data for ${piece}/${importResourceId} is not available at ${planningAreaGadmLocation.uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const stringPlanningAreaGadmOrError = await extractFile(
      readableOrError.right,
      planningAreaGadmLocation.relativePath,
    );
    if (isLeft(stringPlanningAreaGadmOrError)) {
      const errorMessage = `Project metadata file extraction failed: ${planningAreaGadmLocation.relativePath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const planningAreaGadm: PlanningAreaGadmContent = JSON.parse(
      stringPlanningAreaGadmOrError.right,
    );

    await this.entityManager.query(
      `
        UPDATE projects
        SET 
          country_id = $2, 
          admin_area_l1_id = $3, 
          admin_area_l2_id = $4,
          planning_unit_grid_shape = $5,
          planning_unit_area_km2 = $6,
          bbox = $7
        WHERE id = $1
      `,
      [
        importResourceId,
        planningAreaGadm.country,
        planningAreaGadm.l1,
        planningAreaGadm.l2,
        planningAreaGadm.puGridShape,
        planningAreaGadm.planningUnitAreakm2,
        JSON.stringify(planningAreaGadm.bbox),
      ],
    );

    return {
      importId: input.importId,
      componentId: input.componentId,
      importResourceId,
      componentResourceId: input.componentResourceId,
      piece: input.piece,
    };
  }
}
