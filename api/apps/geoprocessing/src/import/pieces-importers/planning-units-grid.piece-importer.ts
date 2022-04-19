import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import {
  ComponentLocationSnapshot,
  ResourceKind,
} from '@marxan/cloning/domain';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
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

type ProjectSelectResult = {
  geomType: PlanningUnitGridShape;
};

@Injectable()
@PieceImportProvider()
export class PlanningUnitsGridPieceImporter implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
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
    const { uris, pieceResourceId, projectId, piece } = input;
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
      const errorMessage = `File with piece data for ${piece}/${pieceResourceId} is not available at ${planningAreaCustomGridLocation.uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    await this.geoprocessingEntityManager.transaction(
      (transactionalEntityManager) =>
        this.processGridFile(
          readableOrError.right,
          planningAreaCustomGridLocation,
          projectId,
          transactionalEntityManager,
        ),
    );

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId,
      projectId,
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
    const message = 'unknown line format';
    this.logger.error(message);
    throw new Error(message);
  }

  private async processGridFile(
    zipStream: Readable,
    planningAreaCustomGridLocation: ComponentLocationSnapshot,
    projectId: string,
    transactionalEntityManager: EntityManager,
  ) {
    const [{ geomType }]: [
      ProjectSelectResult,
    ] = await this.apiEntityManager
      .createQueryBuilder()
      .select('planning_unit_grid_shape', 'geomType')
      .from('projects', 'p')
      .where('id = :projectId', { projectId })
      .execute();

    if (!geomType) {
      const errorMessage = `Project with id ${projectId} has undefined planning unit grid shape`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return new Promise<void>((resolve, reject) => {
      let lastChunkIncompletedData = '';

      zipStream
        .pipe(
          ParseOne(
            new RegExp(`^${planningAreaCustomGridLocation.relativePath}$`),
          ),
        )
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
                  .map((pu) => this.parseGridFileLine(pu));

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
                  [geomType, JSON.stringify(geomPUs)],
                );

                transactionalEntityManager.save(
                  ProjectsPuEntity,
                  geometries.map((geom) => ({
                    projectId,
                    geomType,
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
