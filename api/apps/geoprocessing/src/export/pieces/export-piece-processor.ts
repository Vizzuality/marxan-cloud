import { SetMetadata } from '@nestjs/common';
import {
  ExportJobInput,
  ExportJobOutput,
  PieceProcessor,
} from '@marxan/cloning';

export const ExportPieceProcessorProvider = Symbol(
  `Export piece processor provider`,
);

export const PieceExportProvider = () =>
  SetMetadata(ExportPieceProcessorProvider, true);

export type ExportPieceProcessor = PieceProcessor<
  ExportJobInput,
  ExportJobOutput
>;
