import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { PlanningAreaCustomContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-custom';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
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

type PlanningAreaSelectResult = {
  ewkb: Buffer;
};

type ProjectSelectResult = {
  planning_unit_grid_shape: PlanningUnitGridShape;
  planning_unit_area_km2: number;
};

@Injectable()
@PieceExportProvider()
export class PlanningAreaCustomPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlanningAreaCustomPieceExporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningAreaCustom && kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const projectId = input.resourceId;
    const [project]: [
      ProjectSelectResult,
    ] = await this.apiEntityManager
      .createQueryBuilder()
      .select('planning_unit_grid_shape')
      .addSelect('planning_unit_area_km2')
      .from('projects', 'p')
      .where('id = :projectId', { projectId })
      .execute();

    if (!project) {
      const errorMessage = `Project with ID ${projectId} not found`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const [planningArea]: [
      PlanningAreaSelectResult,
    ] = await this.geoprocessingEntityManager
      .createQueryBuilder()
      .select('ST_AsEWKB(the_geom)', 'ewkb')
      .from(PlanningArea, 'pa')
      .where('project_id = :projectId', { projectId })
      .execute();

    if (!planningArea) {
      const errorMessage = `Custom planning area not found for project with ID: ${projectId}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const content: PlanningAreaCustomContent = {
      puAreaKm2: project.planning_unit_area_km2,
      puGridShape: project.planning_unit_grid_shape,
      planningAreaGeom: planningArea.ewkb.toJSON().data,
    };

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(content)),
      `json`,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${PlanningAreaCustomPieceExporter.name} - Project Custom PA - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningAreaCustom,
        outputFile.right,
      ),
    };
  }
}
