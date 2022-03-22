import { applyDecorators, Header } from '@nestjs/common';

export const BaseTilesResponseHeaders = () =>
  applyDecorators(
    ...[
      Header('Content-Type', 'application/x-protobuf'),
      Header('Content-Disposition', 'attachment'),
      Header('Content-Encoding', 'gzip'),
    ],
  );
