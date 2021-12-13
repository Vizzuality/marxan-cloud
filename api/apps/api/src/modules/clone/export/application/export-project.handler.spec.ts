import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { v4 } from 'uuid';

import { FixtureType } from '@marxan/utils/tests/fixture-type';

import {
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';

import { ExportComponentSnapshot, ExportId } from '../domain';

import { ExportProjectHandler } from './export-project.handler';
import { ResourcePieces } from './resource-pieces.port';
import { ExportRepository } from './export-repository.port';
import { ExportProject } from './export-project.command';
import { InMemoryExportRepo } from '../adapters/in-memory-export.repository';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`requesting new project export`, async () => {
  const { projectId, someScenarioId } = fixtures.GivenProjectWasCreated();
  const exportId = await fixtures.WhenExportIsRequested(projectId);
  await fixtures.ThenExportRequestIsSaved(exportId);
  await fixtures.ThenUnfinishedExportPiecesAreRequestedToProcess(
    projectId,
    someScenarioId,
  );
  await fixtures.ThenExportRequestsEventIsPresent(exportId);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: ResourcePieces,
        useClass: FakePiecesProvider,
      },
      {
        provide: ExportRepository,
        useClass: InMemoryExportRepo,
      },
      ExportProjectHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];

  const sut = sandbox.get(ExportProjectHandler);
  const repo: InMemoryExportRepo = sandbox.get(ExportRepository);
  const piecesResolver: FakePiecesProvider = sandbox.get(ResourcePieces);
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });

  return {
    GivenProjectWasCreated: () => {
      const projectId = v4();
      const someScenarioId = v4();
      piecesResolver.resolveMock.mockImplementationOnce(async () => [
        {
          id: new ComponentId(v4()),
          resourceId: projectId,
          finished: false,
          piece: ClonePiece.ProjectMetadata,
        },
        {
          id: new ComponentId(v4()),
          resourceId: someScenarioId,
          finished: true,
          piece: ClonePiece.PlanningAreaCustom,
        },
        {
          id: new ComponentId(v4()),
          resourceId: someScenarioId,
          finished: false,
          piece: ClonePiece.MarxanSettings,
        },
      ]);
      return { projectId, someScenarioId };
    },
    WhenExportIsRequested: async (projectId: string) =>
      sut.execute(new ExportProject(new ResourceId(projectId))),
    ThenExportRequestIsSaved: async (exportId: ExportId) => {
      expect((await repo.find(exportId))?.toSnapshot()).toBeDefined();
    },
    ThenUnfinishedExportPiecesAreRequestedToProcess: async (
      projectId: string,
      scenarioId: string,
    ) => {
      expect(events[0]).toMatchObject({
        componentId: {
          value: expect.any(String),
        },
        exportId: {
          value: expect.any(String),
        },
        piece: 'project-metadata',
        resourceId: {
          value: projectId,
        },
      });

      expect(events[1]).toMatchObject({
        componentId: {
          value: expect.any(String),
        },
        exportId: {
          value: expect.any(String),
        },
        piece: 'marxan-settings',
        resourceId: {
          value: scenarioId,
        },
      });
    },
    ThenExportRequestsEventIsPresent(exportId: ExportId) {
      expect(events[1]).toMatchObject({
        exportId,
      });
    },
  };
};

@Injectable()
class FakePiecesProvider implements ResourcePieces {
  resolveMock: jest.MockedFunction<ResourcePieces['resolveFor']> = jest.fn();

  async resolveFor(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponentSnapshot[]> {
    return this.resolveMock(id, kind);
  }
}
