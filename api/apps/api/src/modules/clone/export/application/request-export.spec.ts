import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { v4 } from 'uuid';

import { FixtureType } from '@marxan/utils/tests/fixture-type';

import { RequestExport } from './request-export';
import { ResourcePieces } from './resource-pieces.port';
import { ExportRepository } from './export-repository.port';
import {
  ComponentId,
  Export,
  ExportComponentSnapshot,
  ResourceId,
  ResourceKind,
} from '../domain';
import { ClonePiece } from '@marxan/cloning/domain';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`requesting new project export`, async () => {
  const { projectId, someScenarioId } = fixtures.GivenProjectWasCreated();
  await fixtures.WhenExportIsRequested(projectId);
  await fixtures.ThenExportRequestIsSaved(projectId);
  await fixtures.ThenUnfinishedExportPiecesAreRequestedToProcess(
    projectId,
    someScenarioId,
  );
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
      RequestExport,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];

  const sut = sandbox.get(RequestExport);
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
      sut.export(new ResourceId(projectId), ResourceKind.Project),
    ThenExportRequestIsSaved: async (projectId: string) => {
      expect(
        (await repo.find(new ResourceId(projectId)))?.toSnapshot(),
      ).toBeDefined();
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

@Injectable()
class InMemoryExportRepo implements ExportRepository {
  #memory: Record<string, Export> = {};

  async find(projectId: ResourceId): Promise<Export | undefined> {
    return this.#memory[projectId.value];
  }

  async save(exportInstance: Export): Promise<void> {
    this.#memory[exportInstance.resourceId.value] = exportInstance;
  }
}
