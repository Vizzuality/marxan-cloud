import {
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
  LegacyProjectImportPieceProcessor as LegacyProjectImportPieceProcessorPort,
} from '@marxan/legacy-project-import';
import { SetMetadata } from '@nestjs/common';

export const LegacyProjectImportPieceProcessorToken = Symbol(
  `Legacy project import piece processor provider`,
);

export const LegacyProjectImportPieceProcessorProvider = () =>
  SetMetadata(LegacyProjectImportPieceProcessorToken, true);

export type LegacyProjectImportPieceProcessor =
  LegacyProjectImportPieceProcessorPort<
    LegacyProjectImportJobInput,
    LegacyProjectImportJobOutput
  >;
