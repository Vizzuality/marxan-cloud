import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ComponentLocation, ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { PlanningUnitsGridTransform } from '@marxan/cloning/infrastructure/clone-piece-data/planning-units-grid';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
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
    private readonly fileRepository: CloningFilesRepository,
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

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.PlanningUnitsGrid,
    );

    const gridFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      gridFileTransform,
      relativePath,
    );
    if (isLeft(gridFile)) {
      throw new Error(
        `${PlanningUnitsGridPieceExporter.name} - Project Custom PA - couldn't save file - ${gridFile.left.description}`,
      );
    }

    return {
      ...input,
      uris: [new ComponentLocation(gridFile.right, relativePath)],
    };
  }
}
