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
import { GeoJSON } from 'geojson';

@Injectable()
@PieceExportProvider()
export class PlanningAreaCustom extends PieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {
    super();
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.PlanningAreaCustom;
  }

  async run(input: JobInput): Promise<JobOutput> {
    if (input.resourceKind === ResourceKind.Scenario) {
      throw new Error(`Exporting scenario is not yet supported.`);
    }
    // TODO check files on fs - something broke the archive
    const customProjectAreaFile = 'planning-area/project-pa.geojson';

    await delay();

    const metadata = JSON.stringify({
      version: `0.1.0`,
      planningAreaGeometry: {
        uuid: `uuid`,
        file: customProjectAreaFile,
      },
    });

    const geoJson: GeoJSON = {
      bbox: [0, 0, 0, 0, 0, 0],
      coordinates: [],
      type: 'MultiPolygon',
    };

    const planningAreaGeoJson = await this.fileRepository.save(
      Readable.from(JSON.stringify(geoJson)),
      `json`,
    );

    const outputFile = await this.fileRepository.save(
      Readable.from(metadata),
      `json`,
    );

    if (isLeft(outputFile)) {
      throw new Error(
        `${PlanningAreaCustom.name} - Project Custom PA - couldn't save file - ${outputFile.left.description}`,
      );
    }

    if (isLeft(planningAreaGeoJson)) {
      throw new Error(
        `${PlanningAreaCustom.name} - Project Custom PA - couldn't save file - ${planningAreaGeoJson.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath: `planning-area.json`,
        },
        {
          uri: planningAreaGeoJson.right,
          relativePath: customProjectAreaFile,
        },
      ],
    };
  }
}

const delay = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
