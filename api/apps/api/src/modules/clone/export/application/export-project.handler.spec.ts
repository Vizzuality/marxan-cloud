import {
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Injectable } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 } from 'uuid';
import { Project } from '../../../projects/project.api.entity';
import { MemoryExportRepo } from '../adapters/memory-export.repository';
import {
  ExportComponent,
  ExportId,
  ExportRequested,
  PieceExportRequested,
} from '../domain';
import { ExportProject } from './export-project.command';
import { ExportProjectHandler } from './export-project.handler';
import { ExportRepository } from './export-repository.port';
import { ExportResourcePieces } from './export-resource-pieces.port';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`requesting new project export`, async () => {
  const { projectId } = fixtures.GivenProjectWasCreated();
  const { exportId } = await fixtures.WhenExportIsRequested(projectId);
  await fixtures.ThenExportRequestIsSaved(exportId);
  await fixtures.ThenUnfinishedExportPiecesAreRequestedToProcess(projectId);
  fixtures.ThenExportRequestsEventIsPresent(exportId);
});

test(`requesting new project export within a clonning operation`, async () => {
  const { projectId } = fixtures.GivenProjectWasCreated();
  const { exportId } = await fixtures.WhenExportIsRequested(projectId, {
    clonning: true,
  });
  await fixtures.ThenExportRequestIsSaved(exportId, { clonning: true });
  await fixtures.ThenUnfinishedExportPiecesAreRequestedToProcess(projectId);
  fixtures.ThenExportRequestsEventIsPresent(exportId);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: ExportResourcePieces,
        useClass: FakePiecesProvider,
      },
      {
        provide: ExportRepository,
        useClass: MemoryExportRepo,
      },
      {
        provide: getRepositoryToken(Project),
        useClass: FakeProjectRepoProvider,
      },
      ExportProjectHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];

  const sut = sandbox.get(ExportProjectHandler);
  const repo: MemoryExportRepo = sandbox.get(ExportRepository);
  const piecesResolver: FakePiecesProvider = sandbox.get(ExportResourcePieces);
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });
  const ownerId = UserId.create();

  return {
    GivenProjectWasCreated: () => {
      const projectId = ResourceId.create();
      piecesResolver.resolveMock.mockImplementationOnce(async () => [
        ExportComponent.newOne(projectId, ClonePiece.ProjectMetadata),
        ExportComponent.newOne(projectId, ClonePiece.PlanningAreaCustom),
        ExportComponent.newOne(projectId, ClonePiece.ExportConfig),
      ]);
      return { projectId };
    },
    WhenExportIsRequested: async (
      projectId: ResourceId,
      opts: { clonning: boolean } = { clonning: false },
    ) => sut.execute(new ExportProject(projectId, [], ownerId, opts.clonning)),
    ThenExportRequestIsSaved: async (
      exportId: ExportId,
      opts: { clonning: boolean } = { clonning: false },
    ) => {
      const exportInstance = await repo.find(exportId);
      expect(exportInstance?.toSnapshot()).toBeDefined();
      if (!opts.clonning)
        expect(exportInstance?.importResourceId).toEqual(undefined);
      else expect(exportInstance?.importResourceId).toBeDefined();
    },
    ThenUnfinishedExportPiecesAreRequestedToProcess: async (
      projectId: ResourceId,
    ) => {
      const projectMetadataExport = events[0];
      const projectPlanningAreaCustomExport = events[1];
      const exportConfigExport = events[2];

      expect(projectMetadataExport).toBeInstanceOf(PieceExportRequested);
      expect(projectMetadataExport).toMatchObject({
        componentId: expect.any(ComponentId),
        exportId: expect.any(ExportId),
      });

      expect(projectPlanningAreaCustomExport).toBeInstanceOf(
        PieceExportRequested,
      );
      expect(projectPlanningAreaCustomExport).toMatchObject({
        componentId: expect.any(ComponentId),
        exportId: expect.any(ExportId),
      });

      expect(exportConfigExport).toBeInstanceOf(PieceExportRequested);
      expect(exportConfigExport).toMatchObject({
        componentId: expect.any(ComponentId),
        exportId: expect.any(ExportId),
      });
    },
    ThenExportRequestsEventIsPresent(exportId: ExportId) {
      const exportRequested = events[3];
      expect(exportRequested).toBeInstanceOf(ExportRequested);
      expect(exportRequested).toMatchObject({
        exportId,
      });
    },
  };
};

@Injectable()
class FakePiecesProvider implements ExportResourcePieces {
  resolveMock: jest.MockedFunction<
    ExportResourcePieces['resolveForProject']
  > = jest.fn();

  async resolveForProject(
    id: ResourceId,
    scenarioIds: string[],
  ): Promise<ExportComponent[]> {
    return this.resolveMock(id, scenarioIds);
  }

  resolveForScenario(id: ResourceId, kind: ResourceKind): ExportComponent[] {
    return [];
  }
}

@Injectable()
class FakeProjectRepoProvider {
  findOneOrFail() {
    return { organizationId: v4() };
  }

  save() {}
}
