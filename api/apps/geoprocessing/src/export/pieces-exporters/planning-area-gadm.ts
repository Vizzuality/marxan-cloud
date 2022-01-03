import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Readable } from 'stream';
import { isLeft } from 'fp-ts/Either';

import { ClonePiece, JobInput, JobOutput } from '@marxan/cloning';
import { FileRepository } from '@marxan/files-repository';

import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import { PieceExportProvider, PieceProcessor } from '../pieces/piece-processor';
import { ResourceKind } from '@marxan/cloning/domain';

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

  async run(input: JobInput): Promise<JobOutput> {
    if (input.resourceKind === ResourceKind.Scenario) {
      throw new Error(`Exporting scenario is not yet supported.`);
    }

    const gadm: {
      country: string | null;
      l1: string | null;
      l2: string | null;
    }[] = await this.entityManager.query(
      `
    SELECT country_id as country, admin_area_l1_id as l1, admin_area_l2_id as l2 from projects
    WHERE id = $1
    `,
      [input.resourceId],
    );

    const metadata = JSON.stringify({
      gadm: {
        country: gadm?.[0]?.country,
        l1: gadm?.[0]?.l1,
        l2: gadm?.[0]?.l2,
      },
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
