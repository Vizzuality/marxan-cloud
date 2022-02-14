import { SetMetadata } from '@nestjs/common';
import {
  ImportJobInput,
  ImportJobOutput,
  PieceProcessor,
} from '@marxan/cloning';

export const ImportPieceProcessorProvider = Symbol(
  `Import piece processor provider`,
);

export const PieceImportProvider = () =>
  SetMetadata(ImportPieceProcessorProvider, true);

export type ImportPieceProcessor = PieceProcessor<
  ImportJobInput,
  ImportJobOutput
>;
