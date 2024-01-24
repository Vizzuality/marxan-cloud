import {
  ArchiveLocation,
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { ExportComponentSnapshot } from '../../export/domain';
import { ImportComponent } from '../domain';
import { ImportResourcePiecesAdapter } from './import-resource-pieces.adapter';

interface ResolveForProjectParams {
  resourceId: ResourceId;
  pieces: ExportComponentSnapshot[];
  oldProjectId: ResourceId;
}

interface ResolveForScenarioParams {
  resourceId: ResourceId;
  pieces: ExportComponentSnapshot[];
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

  const oldProjectId = ResourceId.create();
  const sut = sandbox.get(ImportResourcePiecesAdapter);

  const projectPieces: ExportComponentSnapshot[] = [
    {
      piece: ClonePiece.ProjectMetadata,
      resourceId: oldProjectId.value,
      finished: true,
      id: ComponentId.create().value,
      uris: [
        { relativePath: 'foo/bar.txt', uri: '/storage/files/foo/bar.txt' },
      ],
    },
  ];
  const getScenarioPieces = (
    id: string,
    resourceKind: ResourceKind,
  ): ExportComponentSnapshot[] => {
    const relativePath =
      resourceKind === ResourceKind.Project
        ? `scenarios/${id}/file.json`
        : 'file.json';

    return [
      {
        piece: ClonePiece.ScenarioMetadata,
        resourceId: id,
        finished: true,
        id: ComponentId.create().value,
        uris: [
          {
            relativePath,
            uri: `/storage/files/${relativePath}`,
          },
        ],
      },
    ];
  };
  const scenariosCount = 3;

  return {
    GivenAProjectImport: () => {
      return {
        resourceId: ResourceId.create(),
        pieces: [
          ...projectPieces,
          ...Array(scenariosCount)
            .fill(0)
            .flatMap(() => getScenarioPieces(v4(), ResourceKind.Project)),
        ],
        oldProjectId,
      };
    },
    GivenAScenarioImport: () => {
      return {
        resourceId: ResourceId.create(),
        pieces: getScenarioPieces(v4(), ResourceKind.Scenario),
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
          pieces: [
            ...projectPieces,
            ...getScenarioPieces(scenarioId, ResourceKind.Project),
          ],
          oldProjectId,
        },
        {
          resourceId: new ResourceId(scenarioId),
          pieces: getScenarioPieces(scenarioId, ResourceKind.Scenario),
        },
        scenarioId,
      ];
    },
    WhenCallingResolveForProject: ({
      resourceId,
      pieces,
      oldProjectId,
    }: ResolveForProjectParams) =>
      sut.resolveForProject(resourceId, pieces, oldProjectId),
    WhenCallingResolveForScenario: ({
      resourceId,
      pieces,
    }: ResolveForScenarioParams) => sut.resolveForScenario(resourceId, pieces),
    WhenCallingResolveForProjectAndForScenario: (
      projectParams: ResolveForProjectParams,
      scenarioParams: ResolveForScenarioParams,
    ) => [
      sut.resolveForProject(
        projectParams.resourceId,
        projectParams.pieces,
        projectParams.oldProjectId,
      ),
      sut.resolveForScenario(scenarioParams.resourceId, scenarioParams.pieces),
    ],
    ThenProjectAndScenarioPiecesShouldBeReturned: (
      components: ImportComponent[],
    ) => {
      expect(components).toHaveLength(
        projectPieces.length +
          getScenarioPieces('', ResourceKind.Project).length * scenariosCount,
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
      expect(components).toHaveLength(
        getScenarioPieces('', ResourceKind.Scenario).length,
      );
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
