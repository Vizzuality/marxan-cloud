import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Readable } from 'stream';
import { isLeft } from 'fp-ts/Either';

import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { FileRepository } from '@marxan/files-repository';

import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import {
  PieceExportProvider,
  ExportPieceProcessor,
} from '../pieces/export-piece-processor';
import { ResourceKind } from '@marxan/cloning/domain';
import { GeoJSON } from 'geojson';
import {
  CustomProjectAreaGeoJsonRelativePath,
  PlanningAreaCustomRelativePath,
} from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-custom';

@Injectable()
@PieceExportProvider()
export class PlanningAreaCustomPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.PlanningAreaCustom;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    if (input.resourceKind === ResourceKind.Scenario) {
      throw new Error(`Exporting scenario is not yet supported.`);
    }
    // TODO check files on fs - something broke the archive

    await delay();

    const metadata = JSON.stringify({
      version: `0.1.0`,
      planningAreaGeometry: {
        uuid: `uuid`,
        file: CustomProjectAreaGeoJsonRelativePath,
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
        `${PlanningAreaCustomPieceExporter.name} - Project Custom PA - couldn't save file - ${outputFile.left.description}`,
      );
    }

    if (isLeft(planningAreaGeoJson)) {
      throw new Error(
        `${PlanningAreaCustomPieceExporter.name} - Project Custom PA - couldn't save file - ${planningAreaGeoJson.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath: PlanningAreaCustomRelativePath,
        },
        {
          uri: planningAreaGeoJson.right,
          relativePath: CustomProjectAreaGeoJsonRelativePath,
        },
      ],
    };
  }
}

const delay = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
