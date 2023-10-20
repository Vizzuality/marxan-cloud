import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  GivenFeatures,
  GivenProjectExists,
  readSavedFile,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { ProjectFeatureAmountsPerPlanningUnitPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/project-feature-amounts-per-planning-unit.piece-exporter';
import { ProjectFeatureAmountsPerPlanningUnitContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-feature-amounts-per-planning-unit';
import {
  FeatureAmountsPerPlanningUnitModule,
  FeatureAmountsPerPlanningUnitRepository,
} from '@marxan/feature-amounts-per-planning-unit';
import { isDefined } from '@marxan/utils';
import {
  SingleConfigFeatureValueStripped,
  SingleSplitConfigFeatureValueStripped,
} from '@marxan/features-hash';
import { SpecificationOperation } from '@marxan/specification';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { DeleteProjectPus, GivenProjectPus } from '../fixtures';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';

type FeatureData = {
  id: string;
  feature_class_name: string;
  creation_status: string;
  project_id: string | null;
  from_geoprocessing_ops?: SingleSplitConfigFeatureValueStripped;
};

let fixtures: FixtureType<typeof getFixtures>;

describe(ProjectFeatureAmountsPerPlanningUnitPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it("saves an empty file when project doesn't have neither derived features and puvspr calculations", async () => {
    const input =
      fixtures.GivenAProjectFeatureAmountsPerPlanningUnitExportJob();
    await fixtures.GivenProjectExist();
    await fixtures.GivenACustomAndAPlatformFeatureForProject();
    fixtures.GivenNoDerivedFeaturesForProject();
    fixtures.GivenProjectDoesNotHaveFeatureAmountsPerPlanningUnit();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAnEmptyProjectFeatureAmountsPerPlanningUnitFileIsSaved();
  });

  it('saves succesfully puvspr calculations for a custom feature ', async () => {
    const input =
      fixtures.GivenAProjectFeatureAmountsPerPlanningUnitExportJob();
    await fixtures.GivenProjectExist();
    const { customFeature } =
      await fixtures.GivenACustomAndAPlatformFeatureForProject();
    await fixtures.GivenProjectHasFeatureAmountsPerPlanningUnit(
      customFeature.id,
    );
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenFeatureAmountsPerPlanningUnitFileHasFeatureAmountsPerPlanningUnitForFeature(
        customFeature,
      );
  });

  it('saves succesfully puvspr calculations for a platform feature ', async () => {
    const input =
      fixtures.GivenAProjectFeatureAmountsPerPlanningUnitExportJob();
    await fixtures.GivenProjectExist();
    const { platformFeature } =
      await fixtures.GivenACustomAndAPlatformFeatureForProject();
    await fixtures.GivenProjectHasFeatureAmountsPerPlanningUnit(
      platformFeature.id,
    );
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenFeatureAmountsPerPlanningUnitFileHasFeatureAmountsPerPlanningUnitForFeature(
        platformFeature,
      );
  });

  it('saves succesfully a split derived feature from a platform feature', async () => {
    const input =
      fixtures.GivenAProjectFeatureAmountsPerPlanningUnitExportJob();
    await fixtures.GivenProjectExist();
    const { platformFeature } =
      await fixtures.GivenACustomAndAPlatformFeatureForProject();
    const derivedFeature = await fixtures.GivenASplitDerivedFeatureForProject(
      platformFeature.id,
    );
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenFeatureAmountsPerPlanningUnitFileHasASplitDerivedFeature(
        derivedFeature,
        platformFeature,
      );
  });

  it('saves succesfully a split derived features from a custom feature', async () => {
    const input =
      fixtures.GivenAProjectFeatureAmountsPerPlanningUnitExportJob();
    await fixtures.GivenProjectExist();
    const { customFeature } =
      await fixtures.GivenACustomAndAPlatformFeatureForProject();
    const derivedFeature = await fixtures.GivenASplitDerivedFeatureForProject(
      customFeature.id,
    );
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenFeatureAmountsPerPlanningUnitFileHasASplitDerivedFeature(
        derivedFeature,
        customFeature,
      );
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.default,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature([ProjectsPuEntity]),
      GeoCloningFilesRepositoryModule,
      FeatureAmountsPerPlanningUnitModule.for(
        geoprocessingConnections.default.name!,
      ),
    ],
    providers: [ProjectFeatureAmountsPerPlanningUnitPieceExporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const projectId = v4();
  const organizationId = v4();
  const sut = sandbox.get(ProjectFeatureAmountsPerPlanningUnitPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const fileRepository = sandbox.get(CloningFilesRepository);
  const featureAmountsPerPlanningUnitRepo = sandbox.get(
    FeatureAmountsPerPlanningUnitRepository,
  );

  const amountOfCustomFeatures = 1;
  const amountOfPlatformFeatures = 1;
  const amountOfPuvsrCalculationsPerFeature = 3;
  const expectedAmountPerPu = 20;

  let featureIds: string[] = [];
  let projectPus: ProjectsPuEntity[];

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
      if (featureIds.length)
        await apiEntityManager
          .createQueryBuilder()
          .delete()
          .from('features')
          .where('id IN (:...featureIds)', { featureIds })
          .execute();

      await DeleteProjectPus(geoEntityManager, projectId);
    },
    GivenAProjectFeatureAmountsPerPlanningUnitExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: projectId,
            piece: ClonePiece.ProjectFeatureAmountsPerPlanningUnit,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ProjectFeatureAmountsPerPlanningUnit,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
      };
    },
    GivenProjectExist: async () => {
      return GivenProjectExists(apiEntityManager, projectId, organizationId);
    },
    GivenACustomAndAPlatformFeatureForProject: async () => {
      const { customFeatures, platformFeatures } = await GivenFeatures(
        apiEntityManager,
        amountOfPlatformFeatures,
        amountOfCustomFeatures,
        projectId,
      );
      featureIds = [platformFeatures[0].id];
      return {
        customFeature: customFeatures[0],
        platformFeature: platformFeatures[0],
      };
    },
    GivenASplitDerivedFeatureForProject: async (baseFeatureId: string) => {
      const derivedFeatureId = v4();
      const geoOperation: SingleConfigFeatureValueStripped = {
        baseFeatureId,
        operation: SpecificationOperation.Split,
        splitByProperty: 'random-property',
        value: 'random-value',
      };
      const derivedFeature = {
        id: derivedFeatureId,
        feature_class_name: 'derived-feature',
        creation_status: 'created',
        project_id: projectId,
        from_geoprocessing_ops: geoOperation,
      };
      await apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('features')
        .values(derivedFeature)
        .execute();

      return derivedFeature;
    },
    GivenNoDerivedFeaturesForProject: () => {},
    GivenProjectHasFeatureAmountsPerPlanningUnit: async (featureId: string) => {
      projectPus = await GivenProjectPus(
        geoEntityManager,
        projectId,
        amountOfPuvsrCalculationsPerFeature,
      );
      const featureAmountsPerPlanningUnit = Array(
        amountOfPuvsrCalculationsPerFeature,
      )
        .fill(0)
        .map((_, index) => ({
          amount: expectedAmountPerPu,
          featureId,
          projectPuId: projectPus[index].id,
        }));
      return featureAmountsPerPlanningUnitRepo.saveAmountPerPlanningUnitAndFeature(
        projectId,
        featureAmountsPerPlanningUnit,
      );
    },
    GivenProjectDoesNotHaveFeatureAmountsPerPlanningUnit: () => {},
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAnEmptyProjectFeatureAmountsPerPlanningUnitFileIsSaved:
          async () => {
            const result = await sut.run(input);
            const file = await fileRepository.get(result.uris[0].uri);
            expect((file as Right<Readable>).right).toBeDefined();
            if (isLeft(file)) throw new Error();
            const savedStrem = file.right;
            const content =
              await readSavedFile<ProjectFeatureAmountsPerPlanningUnitContent>(
                savedStrem,
              );
            expect(content.projectFeaturesGeoOperations).toEqual([]);
            expect(content.featureAmountsPerPlanningUnit).toEqual([]);
          },
        ThenFeatureAmountsPerPlanningUnitFileHasFeatureAmountsPerPlanningUnitForFeature:
          async (feature: FeatureData) => {
            const result = await sut.run(input);
            const file = await fileRepository.get(result.uris[0].uri);
            expect((file as Right<Readable>).right).toBeDefined();
            if (isLeft(file)) throw new Error();
            const savedStrem = file.right;
            const content =
              await readSavedFile<ProjectFeatureAmountsPerPlanningUnitContent>(
                savedStrem,
              );
            expect(
              content.featureAmountsPerPlanningUnit.every(
                ({ amount, featureName, isCustom, puid }) =>
                  amount === expectedAmountPerPu &&
                  featureName === feature.feature_class_name &&
                  isCustom === isDefined(feature.project_id) &&
                  puid <= amountOfPuvsrCalculationsPerFeature,
              ),
            ).toEqual(true);
            expect(content.featureAmountsPerPlanningUnit).toHaveLength(
              amountOfPuvsrCalculationsPerFeature,
            );
          },
        ThenFeatureAmountsPerPlanningUnitFileHasASplitDerivedFeature: async (
          derivedFeature: FeatureData,
          baseFeature: FeatureData,
        ) => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content =
            await readSavedFile<ProjectFeatureAmountsPerPlanningUnitContent>(
              savedStrem,
            );
          expect(content.projectFeaturesGeoOperations).toHaveLength(1);
          const derivedFeatureContent = content.projectFeaturesGeoOperations[0];
          const derivedFeatureOperation =
            derivedFeature.from_geoprocessing_ops!;
          expect(derivedFeatureContent).toEqual({
            featureName: derivedFeature.feature_class_name,
            geoOperation: {
              operation: derivedFeatureOperation.operation,
              splitByProperty: derivedFeatureOperation.splitByProperty,
              value: derivedFeatureOperation.value,
              baseFeatureName: baseFeature.feature_class_name,
              baseFeatureIsCustom: isDefined(baseFeature.project_id),
            },
          });
        },
      };
    },
  };
};
