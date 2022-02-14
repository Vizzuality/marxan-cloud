import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Readable } from 'stream';
import { isLeft } from 'fp-ts/Either';

import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { FileRepository } from '@marxan/files-repository';

import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import { PieceExportProvider, PieceProcessor } from '../pieces/piece-processor';
import { ResourceKind } from '@marxan/cloning/domain';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';

export interface Gadm {
  country: string;
  l1: string | null;
  l2: string | null;
  puGridShape: PlanningUnitGridShape;
  planningUnitAreakm2: number;
  bbox: number[];
}

@Injectable()
@PieceExportProvider()
export class PlanningAreaGadm extends PieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {
    super();
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.PlanningAreaGAdm;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    if (input.resourceKind === ResourceKind.Scenario) {
      throw new Error(`Exporting scenario is not yet supported.`);
    }

    const result: [Gadm] = await this.entityManager.query(
      `
        SELECT 
          country_id as country, 
          admin_area_l1_id as l1, 
          admin_area_l2_id as l2, 
          planning_unit_grid_shape as puGridShape, 
          planning_unit_area_km2 as planningUnitAreakm2,
          bbox
        FROM projects
        WHERE id = $1
      `,
      [input.resourceId],
    );

    if (result.length !== 1) {
      throw new Error(
        `Gadm data not found for project with ID: ${input.resourceId}`,
      );
    }

    const [gadm] = result;

    const metadata = JSON.stringify({
      gadm,
    });

    const outputFile = await this.fileRepository.save(
      Readable.from(metadata),
      `json`,
    );

    if (isLeft(outputFile)) {
      throw new Error(
        `${PlanningAreaGadm.name} - Project GADM - couldn't save file - ${outputFile.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath: `planning-area.json`,
        },
      ],
    };
  }
}
