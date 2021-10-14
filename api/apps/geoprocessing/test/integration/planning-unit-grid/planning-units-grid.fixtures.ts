import { bootstrapApplication } from '../../utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { copyFileSync, readFileSync } from 'fs';
import { plainToClass } from 'class-transformer';
import { v4 } from 'uuid';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { booleanEqual } from '@turf/turf';
import { FeatureCollection } from 'geojson';

import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';
import { JobInput, JobOutput } from '@marxan/planning-units-grid';
import { PlanningUnitsGridProcessor } from '@marxan-geoprocessing/modules/planning-units-grid/planning-units-grid.processor';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const sut: PlanningUnitsGridProcessor = app.get(PlanningUnitsGridProcessor);
  const puGeoRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom),
  );
  const planningAreaRepo: Repository<PlanningArea> = app.get(
    getRepositoryToken(PlanningArea),
  );
  const projectId = v4();
  return {
    cleanup: async () => {
      await puGeoRepo.delete({
        projectId,
      });
      await planningAreaRepo.delete({
        projectId,
      });
      await app.close();
    },
    projectId,
    GivenShapefileWasUploaded: (): JobInput['shapefile'] => {
      const fileName = 'nam-shapefile';
      const baseDir = AppConfig.get<string>(
        'storage.sharedFileStorage.localPath',
      ) as string;
      const shapePath = baseDir + `/${fileName}.zip`;
      copyFileSync(__dirname + `/${fileName}.zip`, shapePath);
      return {
        filename: fileName,
        path: shapePath,
        destination: baseDir,
      };
    },
    WhenConvertingShapefileToPlanningUnits: async (
      input: JobInput['shapefile'],
    ): Promise<JobOutput> => {
      return await sut.process(({
        data: plainToClass<JobInput, JobInput>(JobInput, {
          projectId,
          shapefile: input,
          requestId: v4(),
        }),
      } as unknown) as Job<JobInput, JobOutput>);
    },
    ThenGeoJsonMatchesInput: async (output: JobOutput) => {
      const underlyingGeoJson = JSON.parse(
        readFileSync(__dirname + `/nam.geojson`, {
          encoding: 'utf8',
        }),
      );

      const geoJsonFromGeometries: FeatureCollection = (
        await puGeoRepo.query(
          `
            select json_build_object(
                     'type', 'FeatureCollection',
                     'features',
                     json_agg(ST_AsGeoJSON((t.*)::record, '', 15)::json)
                     )
            from (
                   select the_geom
                   from planning_units_geom
                   where type = 'from_shapefile'
                     and project_id = $1
                 ) as t(geom)
          `,
          [projectId],
        )
      )[0].json_build_object;

      for (const geo of underlyingGeoJson.features) {
        expect(
          geoJsonFromGeometries.features.some((geoFromJson) =>
            booleanEqual(geoFromJson, geo),
          ),
        ).toBeTruthy();
      }

      expect(output.projectId).toEqual(projectId);
      expect(output.geometryIds.length).toEqual(
        underlyingGeoJson.features.length,
      );
    },
    ThenPlanningAreaIsCreated: async (output: JobOutput) => {
      const underlyingGeoJson = JSON.parse(
        readFileSync(__dirname + `/nam-output-pa.geojson`, {
          encoding: 'utf8',
        }),
      );
      const rows = await planningAreaRepo.query(
        `
          select json_build_object(
                   'type', 'FeatureCollection',
                   'features',
                   json_agg(ST_AsGeoJSON((t.*)::record, '', 15)::json)
                   )
          from (
                 select the_geom
                 from planning_areas
                 where project_id = $1
               ) as t(geom)
        `,
        [projectId],
      );
      const geoJsonFromGeometries: FeatureCollection =
        rows[0].json_build_object;
      expect(rows.length).toEqual(1);
      expect(output.projectId).toEqual(projectId);

      for (const geo of underlyingGeoJson.features) {
        expect(
          geoJsonFromGeometries.features.some((geoFromJson) =>
            booleanEqual(geoFromJson, geo),
          ),
        ).toBeTruthy();
      }
    },
    ThenPlanningAreaBBoxIsValid: async (output: JobOutput) => {
      const pa = await planningAreaRepo.findOne({
        where: {
          id: output.planningAreaId,
        },
      });
      expect(pa?.projectId).toEqual(output.projectId);
      expect(pa?.bbox).toEqual([
        20.752019662388175,
        14.905718900381117,
        -17.234315429826474,
        -22.6302376121737,
      ]);
    },
  };
};
