import { bootstrapApplication } from '../../utils';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { copyFileSync, readFileSync } from 'fs';
import { v4 } from 'uuid';
import { EntityManager, In, Repository } from 'typeorm';
import { booleanEqual } from '@turf/turf';
import { FeatureCollection } from 'geojson';

import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { PlanningUnitsGridProcessor } from '@marxan-geoprocessing/modules/planning-area/planning-units-grid/planning-units-grid.processor';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { PromiseType } from 'utility-types';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const sut: PlanningUnitsGridProcessor = app.get(PlanningUnitsGridProcessor);
  const entityManager: EntityManager = app.get(getEntityManagerToken());
  const projectsPuRepo = entityManager.getRepository(ProjectsPuEntity);
  const puGeoRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom),
  );
  const planningAreaRepo: Repository<PlanningArea> = app.get(
    getRepositoryToken(PlanningArea),
  );
  const projectId = v4();
  return {
    cleanup: async () => {
      const projectPus = await projectsPuRepo.find({ where: { projectId } });

      await puGeoRepo.delete({
        id: In(projectPus.map((pu) => pu.geomId)),
      });
      await planningAreaRepo.delete({
        projectId,
      });
      await app.close();
    },
    projectId,
    GivenShapefileWasUploaded: (): Express.Multer.File => {
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
      } as any;
    },
    WhenConvertingShapefileToPlanningUnits: async (
      input: Express.Multer.File,
    ) => {
      return await sut.save(input);
    },
    ThenGeoJsonMatchesInput: async (
      output: PromiseType<ReturnType<PlanningUnitsGridProcessor['save']>>,
    ) => {
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
                   select pug.the_geom
                   from planning_units_geom pug inner join projects_pu ppu on pug.id = ppu.geom_id
                   where type = 'from_shapefile'
                     and ppu.planning_area_id = $1
                 ) as t(geom)
          `,
          [output.id],
        )
      )[0].json_build_object;

      for (const geo of underlyingGeoJson.features) {
        expect(
          geoJsonFromGeometries.features.some((geoFromJson) =>
            booleanEqual(geoFromJson, geo),
          ),
        ).toBeTruthy();
      }
    },
    ThenPlanningAreaIsCreated: async (
      output: PromiseType<ReturnType<PlanningUnitsGridProcessor['save']>>,
    ) => {
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
        [output.id],
      );
      const geoJsonFromGeometries: FeatureCollection =
        rows[0].json_build_object;
      expect(rows.length).toEqual(1);

      for (const geo of underlyingGeoJson.features) {
        expect(
          geoJsonFromGeometries.features.some((geoFromJson) =>
            booleanEqual(geoFromJson, geo),
          ),
        ).toBeTruthy();
      }
    },
    ThenPlanningAreaBBoxIsValid: async (
      output: PromiseType<ReturnType<PlanningUnitsGridProcessor['save']>>,
    ) => {
      const pa = await planningAreaRepo.findOne({
        where: {
          id: output.id,
        },
      });
      expect(pa?.bbox).toEqual([
        20.752019662388175,
        14.905718900381117,
        -17.234315429826474,
        -22.6302376121737,
      ]);
    },
    async ThenThePUCostOfThatPlanningAreaIsCreated(planingAreaId: string) {
      const costForPlanningArea = await puGeoRepo.query(
        `select * from cost_surface_pu_data join projects_pu pp on cost_surface_pu_data.puid = pp.id where pp.planning_area_id = $1`,
        [planingAreaId],
      );
      const pusForProject = await projectsPuRepo.query(
        `select * from projects_pu where planning_area_id = $1`,
        [planingAreaId],
      );
      expect(costForPlanningArea.length).toEqual(pusForProject.length);
    },
  };
};
