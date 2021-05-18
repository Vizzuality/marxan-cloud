import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ShapefileGeoJSONResponseDTO } from 'modules/scenarios/dto/shapefile.geojson.response.dto';
import { isDefined } from '../utils/is-defined';

export function ApiConsumesShapefile(withGeoJsonResponse = true) {
  return applyDecorators(
    ...[
      ApiOperation({
        description:
          'Upload Zip file containing .shp, .dbj, .prj and .shx files',
      }),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        schema: {
          type: 'object',
          properties: {
            file: {
              type: 'Zip file containing .shp, .dbj, .prj and .shx files',
              format: 'binary',
            },
          },
        },
      }),
      withGeoJsonResponse
        ? ApiOkResponse({ type: ShapefileGeoJSONResponseDTO })
        : undefined,
    ].filter(isDefined),
  );
}
