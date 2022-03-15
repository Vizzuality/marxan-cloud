import {
  ArchiveLocation,
  ClonePiece,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import {
  ProjectExportConfigContent,
  ScenarioExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { ImportResourcePiecesAdapter } from './import-resource-pieces.adapter';
import { ImportComponent } from '../domain';
import { v4 } from 'uuid';

interface ResolveForProjectParams {
  resourceId: ResourceId;
  pieces: ProjectExportConfigContent['pieces'];
  archiveLocation: ArchiveLocation;
}

interface ResolveForScenarioParams {
  resourceId: ResourceId;
  pieces: ScenarioExportConfigContent['pieces'];
  archiveLocation: ArchiveLocation;
}

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should return project and scenarios pieces when invoking resolveForProject', async () => {
  const params = fixtures.GivenAProjectImport();
  const result = fixtures.WhenCallingResolveForProject(params);
  fixtures.ThenProjectAndScenarioPiecesShouldBeReturned(result);
});

it('should return scenario pieces when invoking resolveForScenario', async () => {
  const params = fixtures.GivenAScenarioImport();
  const result = fixtures.WhenCallingResolveForScenario(params);
  fixtures.ThenScenarioPiecesShouldBeReturned(result);
});

it('should take into account import kind when returning scenario pieces uris relative paths', async () => {
  const [projectParams, scenarioParams, scenarioId] =
    fixtures.GivenAProjectImportAndAScenarioImport();
  const [projectResult, scenarioResult] =
    fixtures.WhenCallingResolveForProjectAndForScenario(
      projectParams,
      scenarioParams,
    );
  fixtures.ThenScenarioPiecesShouldHaveDifferentRelativePaths(
    projectResult,
    scenarioResult,
    scenarioId,
  );
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [ImportResourcePiecesAdapter],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(ImportResourcePiecesAdapter);

  const projectPieces = [ClonePiece.ProjectMetadata];
  const scenarioPieces = [ClonePiece.ScenarioMetadata];
  const scenariosCount = 3;

  return {
    GivenAProjectImport: () => {
      const scenarioPiecesObject: ProjectExportConfigContent['pieces']['scenarios'] =
        {};
      Array(scenariosCount)
        .fill(0)
        .forEach(() => {
          const id = v4();
          scenarioPiecesObject[id] = scenarioPieces;
        });

      return {
        resourceId: ResourceId.create(),
        pieces: {
          project: projectPieces,
          scenarios: scenarioPiecesObject,
        },
        archiveLocation: new ArchiveLocation('whatever'),
      };
    },
    GivenAScenarioImport: () => {
      return {
        resourceId: ResourceId.create(),
        pieces: scenarioPieces,
        archiveLocation: new ArchiveLocation('whatever'),
      };
    },
    GivenAProjectImportAndAScenarioImport: (): [
      ResolveForProjectParams,
      ResolveForScenarioParams,
      string,
    ] => {
      const scenarioId = v4();
      return [
        {
          resourceId: ResourceId.create(),
          pieces: {
            project: projectPieces,
            scenarios: {
              [scenarioId]: scenarioPieces,
            },
          },
          archiveLocation: new ArchiveLocation('whatever'),
        },
        {
          resourceId: new ResourceId(scenarioId),
          pieces: scenarioPieces,
          archiveLocation: new ArchiveLocation('whatever'),
        },
        scenarioId,
      ];
    },
    WhenCallingResolveForProject: ({
      resourceId,
      archiveLocation,
      pieces,
    }: ResolveForProjectParams) =>
      sut.resolveForProject(resourceId, archiveLocation, pieces),
    WhenCallingResolveForScenario: ({
      resourceId,
      archiveLocation,
      pieces,
    }: ResolveForScenarioParams) =>
      sut.resolveForScenario(
        resourceId,
        archiveLocation,
        pieces,
        ResourceKind.Scenario,
        'it should not affect the test',
      ),
    WhenCallingResolveForProjectAndForScenario: (
      projectParams: ResolveForProjectParams,
      scenarioParams: ResolveForScenarioParams,
    ) => [
      sut.resolveForProject(
        projectParams.resourceId,
        projectParams.archiveLocation,
        projectParams.pieces,
      ),
      sut.resolveForScenario(
        scenarioParams.resourceId,
        scenarioParams.archiveLocation,
        scenarioParams.pieces,
        ResourceKind.Scenario,
        'it should not affect the test',
      ),
    ],
    ThenProjectAndScenarioPiecesShouldBeReturned: (
      components: ImportComponent[],
    ) => {
      expect(components).toHaveLength(
        projectPieces.length + scenarioPieces.length * scenariosCount,
      );

      const projectComponent = components.find(
        (component) => component.piece === ClonePiece.ProjectMetadata,
      );
      const scenarioComponent = components.find(
        (component) => component.piece === ClonePiece.ScenarioMetadata,
      );

      expect(projectComponent?.resourceId).not.toEqual(
        scenarioComponent?.resourceId,
      );
    },
    ThenScenarioPiecesShouldBeReturned: (components: ImportComponent[]) => {
      expect(components).toHaveLength(scenarioPieces.length);
    },
    ThenScenarioPiecesShouldHaveDifferentRelativePaths: (
      projectComponents: ImportComponent[],
      scenarioComponents: ImportComponent[],
      scenarioId: string,
    ) => {
      const scenarioComponentOfProjectImport = projectComponents.find(
        (component) => component.piece === ClonePiece.ScenarioMetadata,
      );
      const scenarioComponent = scenarioComponents.find(
        (component) => component.piece === ClonePiece.ScenarioMetadata,
      );

      expect(scenarioComponentOfProjectImport).toBeDefined();
      expect(scenarioComponent).toBeDefined();

      expect(scenarioComponentOfProjectImport!.resourceId.value).not.toEqual(
        scenarioId,
      );
      expect(scenarioComponent!.resourceId.value).toEqual(scenarioId);

      expect(
        scenarioComponentOfProjectImport!.uris[0].relativePath,
      ).not.toEqual(scenarioComponent!.uris[0].relativePath);
      expect(scenarioComponentOfProjectImport!.uris[0].relativePath).toContain(
        scenarioId,
      );
    },
  };
};
