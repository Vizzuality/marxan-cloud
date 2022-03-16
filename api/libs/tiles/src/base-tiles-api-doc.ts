import { applyDecorators, Header } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const BaseTilesOpenApi = () =>
  applyDecorators(
    ...[
      ApiParam({
        name: 'z',
        description: 'The zoom level ranging from 0 - 12',
        type: Number,
        required: true,
      }),
      ApiParam({
        name: 'x',
        description: 'The tile x offset on Mercator Projection',
        type: Number,
        required: true,
      }),
      ApiParam({
        name: 'y',
        description: 'The tile y offset on Mercator Projection',
        type: Number,
        required: true,
      }),
      ApiQuery({
        name: 'bbox',
        description: 'Bounding box of the project [xMin, xMax, yMin, yMax]',
        type: [Number],
        required: false,
        example: [-1, 40, 1, 42],
      }),
      ApiOkResponse({
        description: 'Binary protobuffer mvt tile',
        type: Buffer,
      }),
      ApiBadRequestResponse(),
      ApiUnauthorizedResponse(),
      Header('Content-Type', 'application/x-protobuf'),
      Header('Content-Disposition', 'attachment'),
      Header('Access-Control-Allow-Origin', '*'),
      Header('Content-Encoding', 'gzip, deflate'),
    ],
  );
