import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import {
  ComponentLocationSnapshot,
  ResourceKind,
} from '@marxan/cloning/domain';
import { FileRepository } from '@marxan/files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable, Transform } from 'stream';
import { EntityManager } from 'typeorm';
import { ParseOne } from 'unzipper';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

@Injectable()
@PieceImportProvider()
export class PlanningAreaCustomGridPieceImporter
  implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlanningAreaCustomGridPieceImporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningAreaGridCustom &&
      kind === ResourceKind.Project
    );
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, importResourceId, piece } = input;

    if (uris.length !== 1) {
      const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    const [planningAreaCustomGridLocation] = uris;

    const readableOrError = await this.fileRepository.get(
      planningAreaCustomGridLocation.uri,
    );
    if (isLeft(readableOrError)) {
      const errorMessage = `File with piece data for ${piece}/${importResourceId} is not available at ${planningAreaCustomGridLocation.uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    await this.processGridFile(
      readableOrError.right,
      planningAreaCustomGridLocation,
      importResourceId,
    );

    return {
      importId: input.importId,
      componentId: input.componentId,
      importResourceId,
      componentResourceId: input.componentResourceId,
      piece: input.piece,
    };
  }

  private parseGridFileLine(pu: string) {
    const regex = /^(\d+),(\[(\d+,)*\d+\])$/gi;
    const result = regex.exec(pu);

    if (result) {
      const [_, puId, geom] = result;
      return { puId: parseInt(puId), geom: JSON.parse(geom) as number[] };
    }
    throw new Error('unknown line format');
  }

  private async processGridFile(
    zipStream: Readable,
    planningAreaCustomGridLocation: ComponentLocationSnapshot,
    projectId: string,
  ) {
    return new Promise((resolve) => {
      let lastChunkIncompletedData = '';

      zipStream
        .pipe(ParseOne(new RegExp(planningAreaCustomGridLocation.relativePath)))
        .pipe(
          new Transform({
            writableObjectMode: true,
            transform: (chunk, encoding, callback) => {
              const data = lastChunkIncompletedData + chunk.toString();

              const lastNewLineIndex = data.lastIndexOf('\n');
              if (lastNewLineIndex === -1) {
                lastChunkIncompletedData = data;
                callback();
                return;
              }
              const processableData = data.substring(0, lastNewLineIndex);
              lastChunkIncompletedData = data.substring(lastNewLineIndex + 1);

              const geomPUs = processableData
                .split('\n')
                .map(this.parseGridFileLine);

              const values = geomPUs
                .map((pu, index) => `($1,$2,ST_GeomFromEWKB($${index + 3}))`)
                .join(',');

              const buffers = geomPUs.map((pu) => Buffer.from(pu.geom));
              this.geoprocessingEntityManager.query(
                `
              INSERT INTO planning_units_geom (type,project_id,the_geom)
              VALUES ${values}
              `,
                [PlanningUnitGridShape.FromShapefile, projectId, ...buffers],
              );
              callback();
            },
          }),
        )
        .on('finish', resolve);
    });
  }
}
