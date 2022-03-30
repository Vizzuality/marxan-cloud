import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { PlanningAreaGadmContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-gadm';
import { FileRepository } from '@marxan/files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

type QueryResult = {
  country_id: string;
  admin_area_l1_id?: string;
  admin_area_l2_id?: string;
  planning_unit_grid_shape: PlanningUnitGridShape;
  planning_unit_area_km2: number;
  bbox: number[];
};

@Injectable()
@PieceExportProvider()
export class PlanningAreaGadmPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlanningAreaGadmPieceExporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningAreaGAdm && kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const projectId = input.resourceId;
    if (input.resourceKind === ResourceKind.Scenario) {
      throw new Error(`Exporting scenario is not yet supported.`);
    }

    const [gadm]: [
      QueryResult,
    ] = await this.entityManager
      .createQueryBuilder()
      .select('country_id')
      .addSelect('admin_area_l1_id')
      .addSelect('admin_area_l2_id')
      .addSelect('planning_unit_grid_shape')
      .addSelect('planning_unit_area_km2')
      .addSelect('bbox')
      .from('projects', 'p')
      .where('id = :projectId', { projectId })
      .execute();

    if (!gadm) {
      const errorMessage = `Gadm data not found for project with ID: ${projectId}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const fileContent: PlanningAreaGadmContent = {
      bbox: gadm.bbox,
      country: gadm.country_id,
      planningUnitAreakm2: gadm.planning_unit_area_km2,
      l1: gadm.admin_area_l1_id,
      l2: gadm.admin_area_l2_id,
    };

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(fileContent)),
      `json`,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${PlanningAreaGadmPieceExporter.name} - Project GADM - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningAreaGAdm,
        outputFile.right,
      ),
    };
  }
}
