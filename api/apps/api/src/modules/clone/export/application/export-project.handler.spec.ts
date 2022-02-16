import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';

import { FixtureType } from '@marxan/utils/tests/fixture-type';

import { ClonePiece, ResourceId, ResourceKind } from '@marxan/cloning/domain';

import {
  ExportComponent,
  PieceExportRequested,
  ExportId,
  ExportRequested,
} from '../domain';

import { ExportProjectHandler } from './export-project.handler';
import { ExportResourcePieces } from './export-resource-pieces.port';
import { ExportRepository } from './export-repository.port';
import { ExportProject } from './export-project.command';
import { InMemoryExportRepo } from '../adapters/in-memory-export.repository';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`requesting new project export`, async () => {
  const { projectId } = fixtures.GivenProjectWasCreated();
  const exportId = await fixtures.WhenExportIsRequested(projectId);
  await fixtures.ThenExportRequestIsSaved(exportId);
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
        useClass: InMemoryExportRepo,
      },
      ExportProjectHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];

  const sut = sandbox.get(ExportProjectHandler);
  const repo: InMemoryExportRepo = sandbox.get(ExportRepository);
  const piecesResolver: FakePiecesProvider = sandbox.get(ExportResourcePieces);
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });

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
    WhenExportIsRequested: async (projectId: ResourceId) =>
      sut.execute(new ExportProject(projectId)),
    ThenExportRequestIsSaved: async (exportId: ExportId) => {
      expect((await repo.find(exportId))?.toSnapshot()).toBeDefined();
    },
    ThenUnfinishedExportPiecesAreRequestedToProcess: async (
      projectId: ResourceId,
    ) => {
      const projectMetadataExport = events[0];
      const projectPlanningAreaCustomExport = events[1];
      const exportConfigExport = events[2];

      expect(projectMetadataExport).toBeInstanceOf(PieceExportRequested);
      expect(projectMetadataExport).toMatchObject({
        componentId: {
          value: expect.any(String),
        },
        exportId: {
          value: expect.any(String),
        },
        piece: 'project-metadata',
        resourceId: {
          value: projectId.value,
        },
      });

      expect(projectPlanningAreaCustomExport).toBeInstanceOf(
        PieceExportRequested,
      );
      expect(projectPlanningAreaCustomExport).toMatchObject({
        componentId: {
          value: expect.any(String),
        },
        exportId: {
          value: expect.any(String),
        },
        piece: 'planning-area-shapefile',
        resourceId: {
          value: projectId.value,
        },
      });

      expect(exportConfigExport).toBeInstanceOf(PieceExportRequested);
      expect(exportConfigExport).toMatchObject({
        componentId: {
          value: expect.any(String),
        },
        exportId: {
          value: expect.any(String),
        },
        piece: 'export-config',
        resourceId: {
          value: projectId.value,
        },
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
    ExportResourcePieces['resolveFor']
  > = jest.fn();

  async resolveFor(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponent[]> {
    return this.resolveMock(id, kind);
  }
}
