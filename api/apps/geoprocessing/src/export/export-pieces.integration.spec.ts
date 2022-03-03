import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';

import { ExportPiecesModule } from './pieces/export-pieces.module';
import { ExportProcessor } from './export.processor';
import {
  PieceExportProvider,
  ExportPieceProcessor,
} from './pieces/export-piece-processor';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`exporting supported piece`, async () => {
  const resourceId = '3';
  const input = {
    piece: ClonePiece.ProjectMetadata,
    componentId: '1',
    exportId: '2',
    resourceId,
    resourceKind: ResourceKind.Project,
    allPieces: [{ resourceId, piece: ClonePiece.ProjectMetadata }],
  };
  const result = await fixtures.sut.run(input);
  expect(result).toEqual({
    ...input,
    uris: [
      {
        uri: `fake-uri`,
        relativePath: `path/file.json`,
      },
    ],
  });
});

test(`exporting unsupported piece`, async () => {
  const resourceId = '3';
  const input = {
    piece: `some piece` as ClonePiece,
    componentId: '1',
    exportId: '2',
    resourceId,
    resourceKind: ResourceKind.Scenario,
    allPieces: [{ resourceId, piece: ClonePiece.ProjectMetadata }],
  };
  expect(async () => await fixtures.sut.run(input)).rejects.toEqual(
    new Error(`some piece is not yet supported.`),
  );
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [ExportPiecesModule],
    providers: [ExportProcessor, FakeProjectMetadataExporter],
  }).compile();

  await sandbox.init();

  const sut = sandbox.get(ExportProcessor);

  return {
    sut,
  };
};

@Injectable()
@PieceExportProvider()
class FakeProjectMetadataExporter implements ExportPieceProcessor {
  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ProjectMetadata;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    return {
      ...input,
      uris: [
        {
          uri: `fake-uri`,
          relativePath: `path/file.json`,
        },
      ],
    };
  }
}
