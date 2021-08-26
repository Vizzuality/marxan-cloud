import { Connection } from 'typeorm';
import { Test } from '@nestjs/testing';
import { Job } from 'bullmq';

import { FakeGeometryExtractor } from './__mocks__/geometry-extractor';
import { createJob } from './__mocks__/job';

import { ShapefileService } from '@marxan/shapefile-converter';
import { ProtectedAreaProcessor } from './protected-area-processor';
import { GeometryExtractor } from './geometry-extractor';
import { ProtectedAreasJobInput } from './worker-input';
import { ProtectedArea } from '../protected-areas.geo.entity';

import { FakeShapefileService } from '../../../utils/__mocks__/shapefile-service';
import { FakeConnection } from '../../../utils/__mocks__/connection';

let fakeConnection: FakeConnection;
let fakeShapefileService: FakeShapefileService;
let fakeExtractor: FakeGeometryExtractor;
let sut: ProtectedAreaProcessor;

let job: Job<ProtectedAreasJobInput>;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: ShapefileService,
        useClass: FakeShapefileService,
      },
      {
        provide: Connection,
        useClass: FakeConnection,
      },
      {
        provide: GeometryExtractor,
        useClass: FakeGeometryExtractor,
      },
      ProtectedAreaProcessor,
    ],
  }).compile();
  sut = sandbox.get(ProtectedAreaProcessor);
  fakeConnection = sandbox.get(Connection);
  fakeShapefileService = sandbox.get(ShapefileService);
  fakeExtractor = sandbox.get(GeometryExtractor);
  job = createJob(`project-id`, `file-name`);
});

describe(`when shapefile returns geometry`, () => {
  beforeEach(() => {
    fakeShapefileService.transformToGeoJsonMock.mockResolvedValue({
      geo: `ok`,
    });
  });

  describe(`when persistence fails`, () => {
    beforeEach(() => {
      fakeConnection.deleteMock.mockResolvedValue({});
      fakeConnection.insertMock.mockImplementationOnce(() => {
        throw new Error('Engine fail.');
      });
      fakeExtractor.extractMock.mockReturnValue([
        {
          type: 'MultiPolygon',
          coordinates: [],
        },
      ]);
    });

    it(`should rollback and cleanup persistence`, async () => {
      await expect(sut.process(job)).rejects.toThrow(/Engine fail/);
      expect(fakeConnection.rollbackMock).toHaveBeenCalled();
      expect(fakeConnection.releaseMock).toHaveBeenCalled();
    });
  });

  describe(`when extractor returns at least one Geometry`, () => {
    beforeEach(async () => {
      fakeConnection.deleteMock.mockResolvedValue({});
      fakeConnection.insertMock.mockResolvedValue({});
      fakeExtractor.extractMock.mockReturnValue([
        {
          type: 'MultiPolygon',
          coordinates: [],
        },
      ]);

      await sut.process(job);
    });

    it(`should perform persistence in transaction`, () => {
      expect(fakeConnection.connectMock).toHaveBeenCalled();
      expect(fakeConnection.startTransactionMock).toHaveBeenCalled();
      expect(fakeConnection.commitMock).toHaveBeenCalled();
      expect(fakeConnection.releaseMock).toHaveBeenCalled();
    });

    it(`should delete previous geometries`, () => {
      expect(fakeConnection.deleteMock.mock.calls[0]).toEqual([
        ProtectedArea,
        {
          projectId: job.data.projectId,
        },
      ]);
    });

    it(`should insert new geometries`, () => {
      expect(fakeConnection.insertMock.mock.calls[0][0]).toEqual(ProtectedArea);
      expect(fakeConnection.insertMock.mock.calls[0][1]).toMatchInlineSnapshot(`
        Array [
          Object {
            "fullName": "file-name",
            "projectId": "project-id",
            "theGeom": [Function],
          },
        ]
      `);
    });
  });

  describe(`when extractor yields no supported geometries`, () => {
    beforeEach(() => {
      fakeExtractor.extractMock.mockReturnValue([]);
    });

    it(`should skip persistence`, async () => {
      await expect(sut.process(job)).rejects.toThrow(/No supported/);
      expect(fakeConnection.connectMock).not.toHaveBeenCalled();
    });
  });
});
