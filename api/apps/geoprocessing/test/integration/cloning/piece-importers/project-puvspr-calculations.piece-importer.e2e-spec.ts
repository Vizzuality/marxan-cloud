import { ProjectCustomFeaturesPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/project-custom-features.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  DeleteProjectPus,
  GivenFeatures,
  GivenProjectExists,
  GivenProjectPus,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { ProjectPuvsprCalculationsPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/project-puvspr-calculations.piece-importer';
import { ProjectPuvsprCalculationsContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-puvspr-calculations';
import { SpecificationOperation } from '@marxan/specification';
import { SingleConfigFeatureValueStripped } from '@marxan/features-hash';
import {
  PuvsprCalculationsEntity,
  PuvsprCalculationsModule,
  PuvsprCalculationsRepository,
} from '@marxan/puvspr-calculations';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';

let fixtures: FixtureType<typeof getFixtures>;

describe(ProjectCustomFeaturesPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when project puvspr calculations file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation =
      fixtures.GivenNoProjectPuvsprCalculationsFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('imports project puvspr calculations', async () => {
    await fixtures.GivenProject();
    const archiveLocation =
      await fixtures.GivenValidProjectPuvsprCalculationsFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenPuvsprCalculationsAreImportedAndDerivedFeaturesAreUpdated();
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
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature(
        [PuvsprCalculationsEntity, ProjectsPuEntity],
        geoprocessingConnections.default,
      ),
      GeoCloningFilesRepositoryModule,
      PuvsprCalculationsModule.for(geoprocessingConnections.default.name!),
    ],
    providers: [ProjectPuvsprCalculationsPieceImporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const projectId = v4();
  const organizationId = v4();
  const userId = v4();

  const geoEntityManager = sandbox.get<EntityManager>(getEntityManagerToken());
  const apiEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );

  const sut = sandbox.get(ProjectPuvsprCalculationsPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);
  const puvsprCalculationsRepo = sandbox.get(PuvsprCalculationsRepository);
  const projectPusRepo: Repository<ProjectsPuEntity> = sandbox.get(
    getRepositoryToken(ProjectsPuEntity),
  );

  const amountOfPuvsprCalculations = 5;
  let featureIds: string[] = [];
  const getFeaturesImported = async () => {
    const projectFeatures: {
      id: string;
      geoOperation: SingleConfigFeatureValueStripped | null;
    }[] = await apiEntityManager
      .createQueryBuilder()
      .select('id')
      .addSelect('from_geoprocessing_ops', 'geoOperation')
      .from('features', 'f')
      .where('project_id = :projectId', { projectId })
      .execute();

    return projectFeatures;
  };

  const getFeatureById = async (featureId: string) => {
    const feature: {
      id: string;
      geoOperation: SingleConfigFeatureValueStripped | null;
    }[] = await apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from('features', 'f')
      .addSelect('from_geoprocessing_ops', 'geoOperation')
      .where('id = :featureId', { featureId })
      .execute();

    return feature.length ? feature[0] : undefined;
  };

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
    GivenProject: () =>
      GivenProjectExists(apiEntityManager, projectId, organizationId),
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ProjectCustomFeatures,
      );
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.ProjectCustomFeatures,
        resourceKind: ResourceKind.Project,
        uris: [{ relativePath, uri: archiveLocation.value }],
        ownerId: userId,
      };
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.ProjectCustomFeatures,
        resourceKind: ResourceKind.Project,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoProjectPuvsprCalculationsFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenValidProjectPuvsprCalculationsFile: async () => {
      const { platformFeatures, customFeatures } = await GivenFeatures(
        apiEntityManager,
        1,
        1,
        projectId,
      );
      const projectPus = await GivenProjectPus(
        geoEntityManager,
        projectId,
        amountOfPuvsprCalculations,
      );
      const basePlatformFeature = platformFeatures[0];
      featureIds = [basePlatformFeature.id];
      const importedSplitDerivedFeature = customFeatures[0];
      const validProjectPuvsprCalculationsFile: ProjectPuvsprCalculationsContent =
        {
          projectFeaturesGeoOperations: [
            {
              featureName: importedSplitDerivedFeature.feature_class_name,
              geoOperation: {
                baseFeatureIsCustom: false,
                baseFeatureName: basePlatformFeature.feature_class_name,
                operation: SpecificationOperation.Split,
                splitByProperty: 'random-property',
              },
            },
          ],
          puvsprCalculations: Array(amountOfPuvsprCalculations)
            .fill(0)
            .map((_, index) => ({
              amount: 200,
              featureName: basePlatformFeature.feature_class_name,
              isCustom: false,
              puid: projectPus[index].puid,
            })),
        };

      const exportId = v4();
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ProjectPuvsprCalculations,
      );

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(validProjectPuvsprCalculationsFile)),
        relativePath,
      );

      if (isLeft(uriOrError)) throw new Error("couldn't save file");
      return new ArchiveLocation(uriOrError.right);
    },
    WhenPieceImporterIsInvoked: (input: ImportJobInput) => {
      return {
        ThenAnUrisArrayErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/uris/gi);
        },
        ThenADataNotAvailableErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /File with piece data for/gi,
          );
        },
        ThenPuvsprCalculationsAreImportedAndDerivedFeaturesAreUpdated:
          async () => {
            const projectFeaturesImported = 1;
            const featuresAlreadyImported = await getFeaturesImported();
            expect(
              featuresAlreadyImported.every(
                ({ geoOperation }) => geoOperation === null,
              ),
            );
            expect(featuresAlreadyImported).toHaveLength(
              projectFeaturesImported,
            );
            const projectPuvsprCalculations =
              await puvsprCalculationsRepo.getAmountPerPlanningUnitAndFeatureInProject(
                projectId,
              );
            expect(projectPuvsprCalculations).toEqual([]);
            const projectPus = await projectPusRepo.find({
              where: { projectId },
            });
            expect(projectPus).toHaveLength(amountOfPuvsprCalculations);

            await sut.run(input);

            const featuresAfterImport = await getFeaturesImported();
            expect(featuresAfterImport).toHaveLength(projectFeaturesImported);
            const splitDerivedFeature = featuresAfterImport[0];
            expect(splitDerivedFeature.geoOperation).not.toEqual(null);
            const baseFeatureId =
              splitDerivedFeature.geoOperation!.baseFeatureId;
            const baseFeature = await getFeatureById(baseFeatureId);
            expect(baseFeature).toBeDefined();
            expect(baseFeature!.geoOperation).toEqual(null);

            const puvsprCalculationsAfterImport =
              await puvsprCalculationsRepo.getAmountPerPlanningUnitAndFeatureInProject(
                projectId,
              );
            expect(puvsprCalculationsAfterImport).toHaveLength(
              amountOfPuvsprCalculations,
            );
            expect(
              puvsprCalculationsAfterImport.every(
                ({ featureId }) => baseFeatureId === featureId,
              ),
            );
          },
      };
    },
  };
};
