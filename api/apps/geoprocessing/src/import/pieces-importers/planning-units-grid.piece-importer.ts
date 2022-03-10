import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
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
export class PlanningUnitsGridPieceImporter implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlanningUnitsGridPieceImporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.PlanningUnitsGrid && kind === ResourceKind.Project
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

    await this.geoprocessingEntityManager.transaction(
      (transactionalEntityManager) =>
        this.processGridFile(
          readableOrError.right,
          planningAreaCustomGridLocation,
          importResourceId,
          transactionalEntityManager,
        ),
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
      const [_, puid, geom] = result;
      return {
        puid: parseInt(puid),
        geom: '\\x' + Buffer.from(JSON.parse(geom) as number[]).toString('hex'),
      };
    }
    throw new Error('unknown line format');
  }

  private async processGridFile(
    zipStream: Readable,
    planningAreaCustomGridLocation: ComponentLocationSnapshot,
    projectId: string,
    transactionalEntityManager: EntityManager,
  ) {
    return new Promise<void>((resolve, reject) => {
      let lastChunkIncompletedData = '';

      zipStream
        .pipe(ParseOne(new RegExp(planningAreaCustomGridLocation.relativePath)))
        .pipe(
          new Transform({
            writableObjectMode: true,
            transform: async (chunk, encoding, callback) => {
              const data = lastChunkIncompletedData + chunk.toString();
              const lastNewLineIndex = data.lastIndexOf('\n');
              if (lastNewLineIndex === -1) {
                lastChunkIncompletedData = data;
                callback();
                return;
              }
              const processableData = data.substring(0, lastNewLineIndex);
              lastChunkIncompletedData = data.substring(lastNewLineIndex + 1);
              try {
                const geomPUs = processableData
                  .split('\n')
                  .map(this.parseGridFileLine);

                const geometries: {
                  id: string;
                  puid: number;
                }[] = await transactionalEntityManager.query(
                  `
                    WITH puid_geom as (
                      SELECT (pu ->> 'puid')::int as puid, ST_GeomFromEwkb((pu ->> 'geom')::bytea) as geom
                      FROM json_array_elements($2) as pu
                    ), uuid_geom as(
                      INSERT INTO planning_units_geom(type, the_geom)
                      SELECT $1, puid_geom.geom
                      FROM puid_geom
                      ON CONFLICT (the_geom_hash, type) DO UPDATE SET type = $1
                      RETURNING id, the_geom
                    )
                    SELECT uuid_geom.id , puid_geom.puid
                    FROM uuid_geom
                      LEFT JOIN puid_geom ON ST_Equals(uuid_geom.the_geom, puid_geom.geom)
                  `,
                  [
                    PlanningUnitGridShape.FromShapefile,
                    JSON.stringify(geomPUs),
                  ],
                );

                transactionalEntityManager.save(
                  ProjectsPuEntity,
                  geometries.map((geom) => ({
                    projectId,
                    geomType: PlanningUnitGridShape.FromShapefile,
                    puid: geom.puid,
                    geomId: geom.id,
                  })),
                );

                callback();
              } catch (err) {
                callback(err as Error);
              }
            },
          }),
        )
        .on('finish', () => {
          !lastChunkIncompletedData
            ? resolve()
            : reject('couldnt parse grid file');
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
}

// WITH foo AS (
// 	SELECT ST_GeomFromEwkb((obj ->> 'geom')::bytea) as geom, obj ->> 'puid' as puid
// 	FROM json_array_elements('[
// 						 	{"puid":4, "geom": "\\x0103000020e610000001000000070000005d5ce4e8cb1c3140c09a48c050792dc04a9dcce8d51f314062d1011d3c702dc0aa3e81325b1c3140bc56378c27672dc047d2587ed6153140bc56378c27672dc07d099355cc12314062d1011d3c702dc0f2cfcb0947163140c09a48c050792dc05d5ce4e8cb1c3140c09a48c050792dc0"}
// 						 ]') as obj
// )
// SELECT pug.id, foo.puid
// FROM planning_units_geom pug, foo
// WHERE ST_Equals(pug.the_geom, foo.geom)
