import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import {
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { ShapefileService } from '@marxan/shapefile-converter';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BBox, FeatureCollection, GeoJSON, Geometry } from 'geojson';
import { chunk } from 'lodash';
import * as path from 'path';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { geoprocessingConnections } from '../../ormconfig';
import {
  LegacyProjectImportPieceProcessor,
  LegacyProjectImportPieceProcessorProvider,
} from '../pieces/legacy-project-import-piece-processor';

type ExpectedGeoJsonFormat = FeatureCollection<Geometry, { puid: number }>;

type GeomIdAndPuid = {
  id: string;
  puid: number;
};

@Injectable()
@LegacyProjectImportPieceProcessorProvider()
export class PlanningGridLegacyProjectPieceImporter
  implements LegacyProjectImportPieceProcessor
{
  private readonly logger: Logger = new Logger(
    PlanningGridLegacyProjectPieceImporter.name,
  );

  constructor(
    private readonly shapefileService: ShapefileService,
    @InjectEntityManager(geoprocessingConnections.default.name)
    private readonly geoEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.apiDB.name)
    private readonly apiEntityManager: EntityManager,
  ) {}

  isSupported(piece: LegacyProjectImportPiece): boolean {
    return piece === LegacyProjectImportPiece.PlanningGrid;
  }

  private logAndThrow(message: string): never {
    this.logger.error(message);
    throw new Error(message);
  }

  private ensureShapefileValidity(geojson: GeoJSON): ExpectedGeoJsonFormat {
    const featureCollection = geojson as ExpectedGeoJsonFormat;
    const isFeatureCollection = Boolean(featureCollection.features);
    if (!isFeatureCollection) {
      this.logAndThrow('Invalid shapefile type. Expected FeatureCollection');
    }

    const validPuids = featureCollection.features.every((feature) => {
      const { puid } = feature.properties ?? { puid: undefined };
      const undefinedPuid = puid === undefined;
      const numericPuid = typeof puid === 'number';
      const puidEqualOrGreaterThanZero = puid >= 0;

      return !undefinedPuid && numericPuid && puidEqualOrGreaterThanZero;
    });

    if (!validPuids) {
      this.logAndThrow(
        'Invalid shapefile data. Each planning unit should have a valid puid',
      );
    }

    return featureCollection;
  }

  private async insertGeometries(
    em: EntityManager,
    data: ExpectedGeoJsonFormat,
  ): Promise<GeomIdAndPuid[]> {
    const result = await Promise.all(
      chunk(data.features, CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS).map<
        Promise<GeomIdAndPuid[]>
      >((pus) =>
        em.query(
          /**
           * @debt Geometries insertion logic is duplicated in
           * api/apps/geoprocessing/src/import/pieces-importers/planning-units-grid.piece-importer.ts
           */
          `
            WITH geom_with_puid as (
              SELECT (pu ->> 'puid')::int as puid, ST_GeomFromGeoJSON((pu ->> 'geom'))::bytea as geom
              FROM json_array_elements($1) as pu
            ), id_with_geom as(
              INSERT INTO planning_units_geom(type, the_geom)
              SELECT 'from_shapefile', geom_with_puid.geom
              FROM geom_with_puid
              ON CONFLICT (the_geom_hash, type) DO UPDATE SET type = 'from_shapefile'
              RETURNING id, the_geom
            )
            SELECT id_with_geom.id , geom_with_puid.puid
            FROM id_with_geom
              LEFT JOIN geom_with_puid ON ST_Equals(id_with_geom.the_geom, geom_with_puid.geom)
          `,
          [
            JSON.stringify(
              pus.map((pu) => ({
                puid: pu.properties.puid,
                geom: pu.geometry,
              })),
            ),
          ],
        ),
      ),
    );

    return result.flat();
  }

  private async insertProjectPus(
    em: EntityManager,
    geomIdsAndPuids: GeomIdAndPuid[],
    projectId: string,
    planningAreaId: string,
  ) {
    const repo = em.getRepository(ProjectsPuEntity);

    await repo.save(
      geomIdsAndPuids.map((el) => ({
        projectId,
        planningAreaId,
        puid: el.puid,
        geomId: el.id,
        geomType: PlanningUnitGridShape.FromShapefile,
      })),
      { chunk: CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS * 10 },
    );
  }

  private async insertPlanningArea(
    em: EntityManager,
    planningAreaId: string,
    projectId: string,
  ): Promise<BBox> {
    const [planningArea]: [
      {
        id: string;
        bbox: BBox;
      },
    ] = await em.query(
      /**
       * @debt Planning area creation from projects pus is duplicated in
       * api/apps/geoprocessing/src/modules/planning-area/planning-units-grid/planning-units-grid.processor.ts
       */
      `
        INSERT INTO "planning_areas"("id", "project_id", "the_geom")
        VALUES (
          $1,
          $2,
          (SELECT ST_MULTI(ST_UNION(the_geom))
            FROM "planning_units_geom" pug
            INNER JOIN "projects_pu" ppu on pug.id = ppu.geom_id
            WHERE ppu.planning_area_id = $1))
        RETURNING "id", "bbox"
      `,
      [planningAreaId, projectId],
    );

    return planningArea.bbox;
  }

  private async updateProject(
    projectId: string,
    planningAreaId: string,
    bbox: BBox,
  ) {
    return this.apiEntityManager
      .createQueryBuilder()
      .update('projects')
      .set({
        planning_unit_grid_shape: PlanningUnitGridShape.FromShapefile,
        planning_area_geometry_id: planningAreaId,
        bbox: JSON.stringify(bbox),
      })
      .where('id = :projectId', { projectId })
      .execute();
  }

  private checkPuidsUniqueness(geojson: ExpectedGeoJsonFormat): number[] {
    const duplicatePuids = new Set<number>();
    const knownPuids: Record<number, true> = {};

    geojson.features.forEach((feature) => {
      const { puid } = feature.properties;

      const knownPuid = knownPuids[puid];

      if (knownPuid) duplicatePuids.add(puid);
      else knownPuids[puid] = true;
    });

    return Array.from(duplicatePuids);
  }

  async run(
    input: LegacyProjectImportJobInput,
  ): Promise<LegacyProjectImportJobOutput> {
    const shapefile = input.files.find(
      (file) => file.type === LegacyProjectImportFileType.PlanningGridShapefile,
    );

    if (!shapefile) {
      this.logAndThrow('Shapefile not found inside input files array');
    }

    const { data } = await this.shapefileService.transformToGeoJson(
      {
        destination: path.dirname(shapefile.location),
        filename: shapefile.type,
        path: shapefile.location,
      },
      { cleanupTemporaryFolders: false },
    );

    const geojson = this.ensureShapefileValidity(data);

    const duplicatePuids = this.checkPuidsUniqueness(geojson);
    if (duplicatePuids.length) {
      this.logAndThrow(
        `Shapefile contains geometries with the same puid. Duplicate puids: ${duplicatePuids.join(
          ', ',
        )}`,
      );
    }

    await this.geoEntityManager.transaction(async (em) => {
      try {
        const planningAreaId = v4();

        const geomIdsAndPuids = await this.insertGeometries(em, geojson);

        await this.insertProjectPus(
          em,
          geomIdsAndPuids,
          input.projectId,
          planningAreaId,
        );
        const bbox = await this.insertPlanningArea(
          em,
          planningAreaId,
          input.projectId,
        );

        await this.updateProject(input.projectId, planningAreaId, bbox);
      } catch (err) {
        this.logger.error(err);
        this.logAndThrow('Error inserting data in database');
      }
    });

    return input;
  }
}
