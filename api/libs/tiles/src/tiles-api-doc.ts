import { applyDecorators, Header } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const TilesOpenApi = () =>
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
        name: 'id',
        description: 'Id of WDPA area',
        type: String,
        required: false,
        example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
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
        type: String,
      }),
      ApiBadRequestResponse(),
      ApiUnauthorizedResponse(),
      Header('Content-Type', 'application/x-protobuf'),
      Header('Content-Disposition', 'attachment'),
      Header('Access-Control-Allow-Origin', '*'),
      Header('Content-Encoding', 'gzip'),
    ],
  );
