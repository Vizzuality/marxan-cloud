import { JobInput, JobOutput } from '@marxan/cloning';
import { Injectable } from '@nestjs/common';

import { PiecesProvider } from './pieces/pieces.provider';

@Injectable()
export class ExportProcessor {
  constructor(private readonly piecesExporters: PiecesProvider) {}

  async run(input: JobInput): Promise<JobOutput> {
    const provider = this.piecesExporters.getPieceProvider(input.piece);
    if (!provider) {
      throw new Error(`${input.piece} is not yet supported.`);
    }
    return await provider.run(input);
  }
}
