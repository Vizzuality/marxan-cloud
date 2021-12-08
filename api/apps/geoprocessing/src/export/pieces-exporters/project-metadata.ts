import { Injectable } from '@nestjs/common';
import { ClonePiece, JobInput, JobOutput } from '@marxan/cloning';
import { PieceExportProvider, PieceProcessor } from '../pieces/piece-processor';

@Injectable()
@PieceExportProvider()
export class ProjectMetadata extends PieceProcessor {
  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ProjectMetadata;
  }

  async run(input: JobInput): Promise<JobOutput> {
    console.log(`exporting project metadata`, input);
    return {
      ...input,
      uri: 'http://marxan.bucket.s3.com/some-file.json-or-zip?',
    };
  }
}
