import { bootstrapApplication } from '../utils';
import * as request from 'supertest';
import { decodeMvt } from '@marxan/utils';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as fs from 'fs';
import { v4 } from 'uuid';
import { ProtectedArea } from '@marxan/protected-areas';
import { seedFeatures } from '../utils/seeds/seed-features';
import { seedWdpa } from '../utils/seeds/seed-wdpa';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const projectId = v4();
  const geoJson = JSON.parse(
    fs.readFileSync(__dirname + '/near-okavongo-square.geojson', 'utf8'),
  );

  const wdpaRepo: Repository<ProtectedArea> = app.get(
    getRepositoryToken(ProtectedArea),
  );

  return {
    projectId,
    seed: async () => {
      await seedFeatures(app);
      await seedWdpa(app);
    },
    GivenCustomProtectedAreaWasCreated: async () => {
      await wdpaRepo.query(
        `
          INSERT INTO "wdpa"("the_geom", "project_id", "full_name")
          SELECT ST_SetSRID(
                   ST_CollectionExtract(ST_Collect(
                                          ST_GeomFromGeoJSON(features ->> 'geometry')
                                          ), 3), 4326)::geometry,
                 $2,
                 $3
          FROM (
                 SELECT json_array_elements($1::json -> 'features') AS features
               ) AS f
          ON CONFLICT ON CONSTRAINT unique_custom_protected_area_geometries_per_project
          DO UPDATE
            SET full_name = EXCLUDED.full_name
        `,
        [geoJson, projectId, `area-name`],
      );
      return {
        projectId,
        name: 'area-name',
      };
    },
    WhenRequestingTile: async () =>
      (
        await request(app.getHttpServer())
          .get(`/api/v1/protected-areas/preview/tiles/6/35/35.mvt`)
          .responseType('blob')
          .buffer()
      ).body,
    WhenRequestingTileForProject: async (projectId: string) =>
      (
        await request(app.getHttpServer())
          .get(
            `/api/v1/protected-areas/${projectId}/preview/tiles/6/35/35.mvt?bbox=[29.36831092834484,19.999534606933707,-17.78080940246582,-26.90732956]`,
          )
          .responseType('blob')
          .buffer()
      ).body,
    ThenItContainsCustomProtectedArea: async (
      mvt: Buffer,
      customPa: { name: string; projectId: string },
    ) => {
      const tile = decodeMvt(mvt);
      const features = tile.layers['layer0']._features.map((_, index) =>
        tile.layers['layer0'].feature(index),
      );
      const customFeature = features.filter(
        (feature) => feature.properties.full_name === customPa.name,
      );

      expect(customFeature.length).toEqual(1);
      /**
       * Note: this was expected toEqual(17) originally; when switching from
       * PostgreSQL 14+PostGIS 3.1 to PostgreSQL 13+PostGIS 3.2 (to match the
       * versions available in Azure Database for PostgreSQL - Flexible Server),
       * processing of the features leads to a count of 18 features (this is
       * due, specifically, to the PostGIS 3.1->3.2 part of the down-up-grade).
       */
      expect(features.length).toEqual(18);

      /**
       * TODO maybe:
       * (customFeature[0].toGeoJSON(6, 35, 35) as any).geometry.coordinates
       *
       * coordinates are in a different projection, thus we cannot compare
       * them to original GeoJSON.
       */
    },
    ThenItHidesCustomProtectedArea: async (
      mvt: Buffer,
      customPa: { name: string; projectId: string },
    ) => {
      const tile = decodeMvt(mvt);
      const features = tile.layers['layer0']._features.map((_, index) =>
        tile.layers['layer0'].feature(index),
      );
      const customFeature = features.filter(
        (feature) => feature.properties.full_name === customPa.name,
      );
      expect(customFeature.length).toEqual(0);
    },
    cleanup: async () => {
      await wdpaRepo.delete({
        projectId,
      });
      await app.close();
    },
  };
};
