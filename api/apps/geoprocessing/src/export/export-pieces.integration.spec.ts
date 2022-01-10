import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

import { ClonePiece, JobInput, JobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';

import { PiecesModule } from './pieces/pieces.module';
import { ExportProcessor } from './export.processor';
import { PieceExportProvider, PieceProcessor } from './pieces/piece-processor';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`exporting supported piece`, async () => {
  const input = {
    piece: ClonePiece.ProjectMetadata,
    componentId: '1',
    exportId: '2',
    resourceId: '3',
    resourceKind: ResourceKind.Project,
    allPieces: [ClonePiece.ProjectMetadata],
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
  const input = {
    piece: `some piece` as ClonePiece,
    componentId: '1',
    exportId: '2',
    resourceId: '3',
    resourceKind: ResourceKind.Scenario,
    allPieces: [ClonePiece.ProjectMetadata],
  };
  await expect(fixtures.sut.run(input)).rejects.toEqual(
    new Error(`some piece is not yet supported.`),
  );
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [PiecesModule],
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
class FakeProjectMetadataExporter extends PieceProcessor {
  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ProjectMetadata;
  }

  async run(input: JobInput): Promise<JobOutput> {
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
