import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { PlanningUnitsGridTransform } from '@marxan/cloning/infrastructure/clone-piece-data/planning-units-grid';
import { FileRepository } from '@marxan/files-repository';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

@Injectable()
@PieceExportProvider()
export class PlanningUnitsGridPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningUnitsGrid && kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const projectId = input.resourceId;
    const qb = this.geoprocessingEntityManager.createQueryBuilder();
    const gridStream = await qb
      .select('ST_AsEWKB(the_geom) as ewkb, ppu.puid as puid')
      .from(PlanningUnitsGeom, 'pug')
      .innerJoin(ProjectsPuEntity, 'ppu', 'pug.id = ppu.geom_id')
      .where('ppu.project_id = :projectId', { projectId })
      .stream();

    const gridFileTransform = new PlanningUnitsGridTransform();

    gridStream.pipe(gridFileTransform);

    const gridFile = await this.fileRepository.save(gridFileTransform);
    if (isLeft(gridFile)) {
      throw new Error(
        `${PlanningUnitsGridPieceExporter.name} - Project Custom PA - couldn't save file - ${gridFile.left.description}`,
      );
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningUnitsGrid,
        gridFile.right,
      ),
    };
  }
}
