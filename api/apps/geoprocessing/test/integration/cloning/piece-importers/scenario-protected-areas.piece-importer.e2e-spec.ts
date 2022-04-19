import { ScenarioProtectedAreasPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/scenario-protected-areas.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { ImportJobInput } from '@marxan/cloning';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ScenarioProtectedAreasContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-protected-areas';
import {
  CloningFilesRepository,
  CloningFileSRepositoryModule,
} from '@marxan/cloning-files-repository';
import { ProtectedArea } from '@marxan/protected-areas';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  DeleteProtectedAreas,
  GenerateRandomGeometries,
  GivenCustomProtectedAreas,
  GivenScenarioExists,
  GivenWdpaProtectedAreas,
  PrepareZipFile,
} from '../fixtures';

interface ScenarioSelectResult {
  protected_area_filter_by_ids: string[];
  wdpa_threshold: number;
}

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioProtectedAreasPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when scenario protected areas file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoScenarioProtectedAreasFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('fails if a custom protected area is not found', async () => {
    await fixtures.GivenWdpaAndCustomProtectedAreas();
    const archiveLocation = await fixtures.GivenScenarioProtectedAreasFileWithAnUnexistingCustomProtectedArea();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenACustomProtectedAreaNotFoundErrorShouldBeThrown();
  });

  it('fails if a wdpa protected area is not found', async () => {
    await fixtures.GivenWdpaAndCustomProtectedAreas();
    const archiveLocation = await fixtures.GivenScenarioProtectedAreasFileWithAnUnexistingWdpaProtectedArea();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAWdpaProtectedAreaNotFoundErrorShouldBeThrown();
  });

  it('imports scenario protected areas', async () => {
    await fixtures.GivenWdpaAndCustomProtectedAreas();
    await fixtures.GivenScenario();
    const archiveLocation = await fixtures.GivenValidScenarioProtectedAreasFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenScenarioProtectedAreasShouldBeImported();
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
      TypeOrmModule.forFeature([
        ScenariosPuPaDataGeo,
        ProjectsPuEntity,
        PlanningUnitsGeom,
        ProtectedArea,
      ]),
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
      CloningFileSRepositoryModule,
    ],
    providers: [
      ScenarioProtectedAreasPieceImporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();

  const scenarioId = v4();
  const projectId = v4();
  const organizationId = v4();
  const resourceKind = ResourceKind.Project;
  const oldScenarioId = v4();
  const userId = v4();

  const sut = sandbox.get(ScenarioProtectedAreasPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);
  const geoprocessingEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.default.name),
  );
  const apiEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );

  const amountOfWdpaProtectedAreas = 3;
  const amountOfCustomProtectedAreas = 3;

  const expectedThreshold = 60;
  let expectedProtectedAreasIds: string[] = [];
  let validScenarioProtectedAreasFileContent: ScenarioProtectedAreasContent;

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );

      await DeleteProtectedAreas(
        geoprocessingEntityManager,
        expectedProtectedAreasIds,
      );
    },
    GivenScenario: () => {
      return GivenScenarioExists(
        apiEntityManager,
        scenarioId,
        projectId,
        organizationId,
      );
    },
    GivenWdpaAndCustomProtectedAreas: async () => {
      const wdpaProtectedAreas = await GivenWdpaProtectedAreas(
        geoprocessingEntityManager,
        amountOfWdpaProtectedAreas,
      );
      const customProtectedAreas = await GivenCustomProtectedAreas(
        geoprocessingEntityManager,
        amountOfCustomProtectedAreas,
        projectId,
      );

      validScenarioProtectedAreasFileContent = {
        threshold: expectedThreshold,
        customProtectedAreas: customProtectedAreas.map((pa) => ({
          geom: pa.geom.toJSON().data,
          name: pa.fullName,
        })),
        wdpa: wdpaProtectedAreas.map((pa) => pa.wdpaId),
      };

      expectedProtectedAreasIds = [
        ...wdpaProtectedAreas.map((pa) => pa.id),
        ...customProtectedAreas.map((pa) => pa.id),
      ];
    },
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const [
        uri,
      ] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.ScenarioProtectedAreas,
        archiveLocation.value,
        { kind: resourceKind, scenarioId: oldScenarioId },
      );
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.ScenarioProtectedAreas,
        resourceKind,
        uris: [uri.toSnapshot()],
        ownerId: userId,
      };
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: scenarioId,
        importId: v4(),
        projectId,
        piece: ClonePiece.ScenarioProtectedAreas,
        resourceKind,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoScenarioProtectedAreasFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenScenarioProtectedAreasFileWithAnUnexistingCustomProtectedArea: async () => {
      const [
        { relativePath },
      ] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.ScenarioProtectedAreas,
        'scenario protected areas file relative path',
        { kind: resourceKind, scenarioId: oldScenarioId },
      );
      const [geometry] = await GenerateRandomGeometries(
        geoprocessingEntityManager,
        1,
        true,
      );
      const invalidScenarioProtectedAreasFileContent: ScenarioProtectedAreasContent = {
        ...validScenarioProtectedAreasFileContent,
        customProtectedAreas: validScenarioProtectedAreasFileContent.customProtectedAreas.concat(
          {
            name: 'Unexisting custom protected area',
            geom: geometry.toJSON().data,
          },
        ),
      };

      return PrepareZipFile(
        invalidScenarioProtectedAreasFileContent,
        fileRepository,
        relativePath,
      );
    },
    GivenScenarioProtectedAreasFileWithAnUnexistingWdpaProtectedArea: async () => {
      const [
        { relativePath },
      ] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.ScenarioProtectedAreas,
        'scenario protected areas file relative path',
        { kind: resourceKind, scenarioId: oldScenarioId },
      );
      const invalidScenarioProtectedAreasFileContent: ScenarioProtectedAreasContent = {
        ...validScenarioProtectedAreasFileContent,
        wdpa: validScenarioProtectedAreasFileContent.wdpa.concat(-1),
      };

      return PrepareZipFile(
        invalidScenarioProtectedAreasFileContent,
        fileRepository,
        relativePath,
      );
    },
    GivenValidScenarioProtectedAreasFile: async () => {
      const [
        { relativePath },
      ] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.ScenarioProtectedAreas,
        'scenario protected areas file relative path',
        { kind: resourceKind, scenarioId: oldScenarioId },
      );

      return PrepareZipFile(
        validScenarioProtectedAreasFileContent,
        fileRepository,
        relativePath,
      );
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
        ThenACustomProtectedAreaNotFoundErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /custom protected area not found/gi,
          );
        },
        ThenAWdpaProtectedAreaNotFoundErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /WDPA protected areas not found/gi,
          );
        },
        ThenScenarioProtectedAreasShouldBeImported: async () => {
          await sut.run(input);

          const [scenario]: [
            ScenarioSelectResult,
          ] = await apiEntityManager
            .createQueryBuilder()
            .select('protected_area_filter_by_ids, wdpa_threshold')
            .from('scenarios', 's')
            .where('id = :scenarioId', { scenarioId })
            .execute();

          expect(scenario.wdpa_threshold).toEqual(expectedThreshold);
          expect(scenario.protected_area_filter_by_ids.sort()).toEqual(
            expectedProtectedAreasIds.sort(),
          );
        },
      };
    },
  };
};
