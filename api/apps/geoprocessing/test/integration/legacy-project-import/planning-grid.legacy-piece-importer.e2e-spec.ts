import { PlanningGridLegacyProjectPieceImporter } from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/planning-grid.legacy-piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import {
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { ShapefileService } from '@marxan/shapefile-converter';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { Feature, GeoJSON } from 'geojson';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { validGeojson } from './fake-geojsons';
import {
  DeleteProjectAndScenarioShells,
  GivenProjectAndScenarioShells,
} from './fixtures';

type ProjectSelectResult = {
  planning_area_geometry_id: string;
  bbox: string;
  planning_unit_grid_shape: PlanningUnitGridShape;
};

let fixtures: FixtureType<typeof getFixtures>;

describe(PlanningGridLegacyProjectPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when planning grid shapefile is missing in files array', async () => {
    const job = fixtures.GivenJobInput({ missingPlanningGridShapefile: true });

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAShapefileNotFoundErrorShouldBeThrown();
  });

  it(`fails when shapefile type is different to FeaturesCollection`, async () => {
    const job = fixtures.GivenJobInput();
    fixtures.GivenInvalidShapefileType();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAnInvalidShapefileTypeErrorShouldBeThrown();
  });

  it(`fails if shapefile contains geometries without puids`, async () => {
    const job = fixtures.GivenJobInput();
    fixtures.GivenShapefileWithoutPuids();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAnInvalidShapefileDataErrorShouldBeThrown();
  });

  it(`fails if shapefile contains geometries with duplicate puids`, async () => {
    const job = fixtures.GivenJobInput();
    fixtures.GivenShapefileWithDuplicatePuids();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADuplicatePuidsErrorShouldBeThrown();
  });

  it(`fails if shapefile contains geometries with non numeric puids`, async () => {
    const job = fixtures.GivenJobInput();
    fixtures.GivenShapefileWithNonNumericPuids();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAnInvalidShapefileDataErrorShouldBeThrown();
  });

  it(`fails if shapefile contains geometries with negative puids`, async () => {
    const job = fixtures.GivenJobInput();
    fixtures.GivenShapefileWithNegativePuids();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAnInvalidShapefileDataErrorShouldBeThrown();
  });

  it('imports successfully planning area, geometries, projects pus and updates project', async () => {
    const job = fixtures.GivenJobInput();
    await fixtures.GivenProjectAndScenarioShells();
    fixtures.GivenValidShapefile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenPlanningGridShouldBeImported();
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.default,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature(
        [ProjectsPuEntity, PlanningUnitsGeom, PlanningArea],
        geoprocessingConnections.default,
      ),
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
    ],
    providers: [
      PlanningGridLegacyProjectPieceImporter,
      {
        provide: ShapefileService,
        useClass: FakeShapefileService,
      },
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const organizationId = v4();
  const projectId = v4();
  const scenarioId = v4();

  const sut = sandbox.get(PlanningGridLegacyProjectPieceImporter);
  const fakeShapefileService: FakeShapefileService = sandbox.get(
    ShapefileService,
  );
  const apiEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );
  const projectsPusRepo = sandbox.get<Repository<ProjectsPuEntity>>(
    getRepositoryToken(ProjectsPuEntity, geoprocessingConnections.default.name),
  );
  const geometriesRepo = sandbox.get<Repository<PlanningUnitsGeom>>(
    getRepositoryToken(
      PlanningUnitsGeom,
      geoprocessingConnections.default.name,
    ),
  );
  const planningAreasRepo = sandbox.get<Repository<PlanningArea>>(
    getRepositoryToken(PlanningArea, geoprocessingConnections.default.name),
  );

  return {
    cleanUp: async () => {
      await DeleteProjectAndScenarioShells(
        apiEntityManager,
        organizationId,
        projectId,
      );

      const geomIds = await projectsPusRepo.find({
        where: { projectId },
        select: ['geomId'],
      });
      await geometriesRepo.delete({
        id: In(geomIds.map((record) => record.geomId)),
      });
      await planningAreasRepo.delete({ projectId });
    },
    GivenProjectAndScenarioShells: () =>
      GivenProjectAndScenarioShells(
        apiEntityManager,
        organizationId,
        projectId,
        scenarioId,
      ),
    GivenJobInput: (
      { missingPlanningGridShapefile } = {
        missingPlanningGridShapefile: false,
      },
    ): LegacyProjectImportJobInput => {
      return {
        piece: LegacyProjectImportPiece.PlanningGrid,
        files: missingPlanningGridShapefile
          ? []
          : [
              {
                id: v4(),
                location: '/tmp/bar/shapefile.zip',
                type: LegacyProjectImportFileType.PlanningGridShapefile,
              },
            ],
        pieceId: v4(),
        projectId,
        scenarioId,
        ownerId: v4(),
      };
    },
    GivenUser: () => {},
    GivenValidShapefile: () => {
      fakeShapefileService.geojson = validGeojson;
    },
    GivenShapefileWithoutPuids: () => {
      const invalidGeojson = {
        ...validGeojson,
        features: validGeojson.features.map((feature) => ({
          ...feature,
          properties: {
            ...feature.properties,
            puid: undefined,
          },
        })),
      };

      fakeShapefileService.geojson = invalidGeojson;
    },
    GivenShapefileWithNonNumericPuids: () => {
      const invalidGeojson = {
        ...validGeojson,
        features: validGeojson.features.map((feature) => ({
          ...feature,
          properties: {
            ...feature.properties,
            puid: feature.properties!.puid.toString(),
          },
        })),
      };

      fakeShapefileService.geojson = invalidGeojson;
    },
    GivenShapefileWithNegativePuids: () => {
      const invalidGeojson = {
        ...validGeojson,
        features: validGeojson.features.map((feature) => ({
          ...feature,
          properties: {
            ...feature.properties,
            puid: feature.properties!.puid * -1,
          },
        })),
      };

      fakeShapefileService.geojson = invalidGeojson;
    },
    GivenShapefileWithDuplicatePuids: () => {
      const [feature] = validGeojson.features;

      const invalidGeojson = {
        ...validGeojson,
        features: [feature, feature],
      };

      fakeShapefileService.geojson = invalidGeojson;
    },
    GivenInvalidShapefileType: () => {
      const invalidGeojson: Feature = {
        type: 'Feature',
        properties: {},
        geometry: validGeojson.features[0].geometry,
      };

      fakeShapefileService.geojson = invalidGeojson;
    },
    WhenPieceImporterIsInvoked: (input: LegacyProjectImportJobInput) => {
      return {
        ThenAShapefileNotFoundErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/shapefile not found/gi);
        },
        ThenAnInvalidShapefileTypeErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /invalid shapefile type/gi,
          );
        },
        ThenAnInvalidShapefileDataErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /invalid shapefile data/gi,
          );
        },
        ThenADuplicatePuidsErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /shapefile contains geometries with the same puid/gi,
          );
        },
        ThenPlanningGridShouldBeImported: async () => {
          await sut.run(input);

          const [project]: [
            ProjectSelectResult,
          ] = await apiEntityManager
            .createQueryBuilder()
            .select()
            .from('projects', 'p')
            .where('id = :projectId', { projectId })
            .execute();

          expect(project.bbox).toBeDefined();
          expect(project.planning_area_geometry_id).toBeDefined();
          expect(project.planning_unit_grid_shape).toBe(
            PlanningUnitGridShape.FromShapefile,
          );

          const expectedLength = validGeojson.features.length;

          const projectPus = await projectsPusRepo.find({
            where: { projectId },
            relations: ['puGeom'],
          });

          expect(projectPus).toHaveLength(expectedLength);

          const planningArea = await planningAreasRepo.findOne({
            where: { projectId },
          });
          expect(planningArea).toBeDefined();
          expect(planningArea!.id).toEqual(project.planning_area_geometry_id);
        },
      };
    },
  };
};

class FakeShapefileService {
  public geojson: GeoJSON | undefined;

  async transformToGeoJson(): Promise<{
    data: GeoJSON;
  }> {
    if (!this.geojson)
      throw new Error(
        'geojson public member must be initialized before calling this method',
      );

    return {
      data: this.geojson,
    };
  }
}
