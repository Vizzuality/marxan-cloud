import { ClonePiece, ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepPartial } from 'utility-types';
import { v4 } from 'uuid';
import { Project } from '../../../projects/project.api.entity';
import { ExportComponent } from '../domain';
import { ExportResourcePiecesAdapter } from './export-resource-pieces.adapter';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('resolves project pieces', async () => {
  const projectId = fixtures.GivenAProjectExport();
  const result = await fixtures.WhenRequestingExportPieces(
    projectId,
    ResourceKind.Project,
    [],
  );
  fixtures.ThenProjectPiecesShouldBeIncluded({ components: result });
});

it(`resolves ${ClonePiece.PlanningAreaCustom} piece when invoked with a custom planning area project`, async () => {
  const projectId = fixtures.GivenAProjectExportWithCustomPlanningArea();
  const result = await fixtures.WhenRequestingExportPieces(
    projectId,
    ResourceKind.Project,
    [],
  );
  fixtures.ThenProjectPiecesShouldBeIncluded({
    components: result,
    projectWithCustomPlanningArea: true,
  });
});

it('resolves scenario pieces', async () => {
  const scenarioId = fixtures.GivenAScenarioExport();
  const result = await fixtures.WhenRequestingExportPieces(
    scenarioId,
    ResourceKind.Scenario,
    [],
  );
  fixtures.ThenScenarioPiecesShouldBeIncluded({
    components: result,
  });
});

it('resolves project and specific scenario pieces when invoked specifying an array of scenarios ids', async () => {
  const projectScenariosCount = 5;
  const [projectId, scenariosIds] = fixtures.GivenAProjectExportWithScenarios(
    projectScenariosCount,
  );
  const scenariosToBeExportedCount = 2;

  const result = await fixtures.WhenRequestingExportPieces(
    projectId,
    ResourceKind.Project,
    scenariosIds.slice(0, scenariosToBeExportedCount),
  );
  fixtures.ThenProjectAndScenarioPiecesShouldBeIncluded({
    components: result,
    projectWithCustomPlanningArea: false,
    scenariosCount: scenariosToBeExportedCount,
  });
});

const getFixtures = async () => {
  const projectRepoToken = getRepositoryToken(Project);
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [
      {
        provide: projectRepoToken,
        useClass: FakeProjectRepo,
      },
      ExportResourcePiecesAdapter,
    ],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(ExportResourcePiecesAdapter);
  const repo = sandbox.get(projectRepoToken) as FakeProjectRepo;

  const expectedProjectPieces = (projectWithCustomPlanningArea: boolean) => {
    const planningAreaComponents = projectWithCustomPlanningArea
      ? [ClonePiece.PlanningAreaCustom, ClonePiece.PlanningAreaCustomGeojson]
      : [ClonePiece.PlanningAreaGAdm];

    return [
      ClonePiece.ExportConfig,
      ClonePiece.ProjectMetadata,
      ...planningAreaComponents,
      ClonePiece.PlanningUnitsGrid,
      ClonePiece.PlanningUnitsGridGeojson,
      ClonePiece.ProjectCustomProtectedAreas,
      ClonePiece.ProjectCustomFeatures,
    ];
  };

  const expectedScenarioPieces = (projectExport: boolean) => {
    const pieces = [
      ClonePiece.ScenarioMetadata,
      ClonePiece.ScenarioProtectedAreas,
      ClonePiece.ScenarioPlanningUnitsData,
      ClonePiece.ScenarioRunResults,
      ClonePiece.ScenarioFeaturesData,
      ClonePiece.ScenarioInputFolder,
      ClonePiece.ScenarioOutputFolder,
      ClonePiece.FeaturesSpecification,
      ClonePiece.MarxanExecutionMetadata,
    ];
    if (!projectExport) pieces.push(ClonePiece.ExportConfig);
    return pieces;
  };

  return {
    GivenAProjectExport: () => {
      const projectId = ResourceId.create();
      repo.mockProject(projectId.value, {});

      return projectId;
    },
    GivenAProjectExportWithARegularPlanningArea: () => {
      const projectId = ResourceId.create();
      repo.mockProject(projectId.value, {});

      return projectId;
    },
    GivenAProjectExportWithCustomPlanningArea: () => {
      const projectId = ResourceId.create();
      repo.mockProject(projectId.value, { planningAreaGeometryId: v4() });

      return projectId;
    },
    GivenAProjectExportWithScenarios: (
      scenariosCount: number,
    ): [ResourceId, string[]] => {
      const projectId = ResourceId.create();
      const scenarios: { id: string }[] = Array(scenariosCount)
        .fill(0)
        .map(() => ({
          id: v4(),
        }));

      repo.mockProject(projectId.value, {
        scenarios,
      });

      return [projectId, scenarios.map((scenario) => scenario.id)];
    },
    GivenAScenarioExport: () => {
      return ResourceId.create();
    },
    WhenRequestingExportPieces: (
      id: ResourceId,
      kind: ResourceKind,
      scenarioIds: string[],
    ) => {
      if (kind === ResourceKind.Project)
        return sut.resolveForProject(id, scenarioIds);

      return sut.resolveForScenario(id, kind);
    },
    ThenProjectPiecesShouldBeIncluded: ({
      components,
      projectWithCustomPlanningArea = false,
    }: {
      components: ExportComponent[];
      projectWithCustomPlanningArea?: boolean;
    }) => {
      const expectedPieces = expectedProjectPieces(
        projectWithCustomPlanningArea,
      );

      expect(components.map((component) => component.piece).sort()).toEqual(
        expectedPieces.sort(),
      );
    },
    ThenScenarioPiecesShouldBeIncluded: ({
      components,
    }: {
      components: ExportComponent[];
    }) => {
      const expectedPieces = expectedScenarioPieces(false);

      expect(components.map((component) => component.piece).sort()).toEqual(
        expectedPieces.sort(),
      );
    },
    ThenProjectAndScenarioPiecesShouldBeIncluded: ({
      components,
      projectWithCustomPlanningArea = false,
      scenariosCount,
    }: {
      components: ExportComponent[];
      projectWithCustomPlanningArea?: boolean;
      scenariosCount: number;
    }) => {
      const expectedPieces = [
        ...expectedProjectPieces(projectWithCustomPlanningArea),
        ...Array(scenariosCount).fill(expectedScenarioPieces(true)).flat(),
      ];

      expect(components.map((component) => component.piece).sort()).toEqual(
        expectedPieces.sort(),
      );
    },
  };
};

type ProjectMock = DeepPartial<Project>;
type MockProjectOptions = Omit<ProjectMock, 'id'>;

class FakeProjectRepo {
  projects: Record<string, ProjectMock> = {};

  findOneOrFail(id: string) {
    return this.projects[id];
  }

  mockProject(
    id: string,
    { scenarios, planningAreaGeometryId }: MockProjectOptions,
  ) {
    this.projects[id] = {
      id,
      scenarios,
      planningAreaGeometryId,
    };
  }
}
