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

it('should return project pieces when resolving for a project', async () => {
  const projectId = fixtures.GivenAProjectExport();
  const result = await fixtures.WhenRequestingExportPieces(
    projectId,
    ResourceKind.Project,
  );
  fixtures.ThenProjectPiecesShouldBeIncluded({ components: result });
});

it(`should return ${ClonePiece.PlanningAreaCustom} when resolving for a project with a custom planning area`, async () => {
  const projectId = fixtures.GivenAProjectExportWithCustomPlanningArea();
  const result = await fixtures.WhenRequestingExportPieces(
    projectId,
    ResourceKind.Project,
  );
  fixtures.ThenProjectPiecesShouldBeIncluded({
    components: result,
    projectWithCustomPlanningArea: true,
  });
});

it('should return scenario pieces when resolving for a scenario', async () => {
  const scenarioId = fixtures.GivenAScenarioExport();
  const result = await fixtures.WhenRequestingExportPieces(
    scenarioId,
    ResourceKind.Scenario,
  );
  fixtures.ThenScenarioPiecesShouldBeIncluded({
    components: result,
  });
});

it('should return project and scenario pieces when resolving for a project if the project has scenarios', async () => {
  const scenariosCount = 2;
  const projectId = fixtures.GivenAProjectExportWithScenarios(scenariosCount);
  const result = await fixtures.WhenRequestingExportPieces(
    projectId,
    ResourceKind.Project,
  );
  fixtures.ThenProjectAndScenarioPiecesShouldBeIncluded({
    components: result,
    projectWithCustomPlanningArea: false,
    scenariosCount,
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

  const expectedProjectPieces = (projectWithCustomPlanningArea: boolean) => [
    ClonePiece.ExportConfig,
    ClonePiece.ProjectMetadata,
    projectWithCustomPlanningArea
      ? ClonePiece.PlanningAreaCustom
      : ClonePiece.PlanningAreaGAdm,
    ClonePiece.ProjectCustomProtectedAreas,
  ];

  const expectedScenarioPieces = (projectExport: boolean) => {
    const pieces = [
      ClonePiece.ScenarioMetadata,
      ClonePiece.ScenarioProtectedAreas,
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
    GivenAProjectExportWithCustomPlanningArea: () => {
      const projectId = ResourceId.create();

      repo.mockProject(projectId.value, { planningAreaGeometryId: v4() });

      return projectId;
    },
    GivenAProjectExportWithScenarios: (scenariosCount: number) => {
      const projectId = ResourceId.create();
      const scenarios = Array(scenariosCount).fill({ id: v4() });

      repo.mockProject(projectId.value, {
        scenarios,
      });

      return projectId;
    },
    GivenAScenarioExport: () => {
      return ResourceId.create();
    },
    WhenRequestingExportPieces: (id: ResourceId, kind: ResourceKind) => {
      return sut.resolveFor(id, kind);
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
