import { isDefined } from '@marxan/utils';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ShapefileGeoJSONResponseDTO } from '@marxan-api/modules/scenarios/dto/shapefile.geojson.response.dto';

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
              description:
                'Zip file containing .shp, .dbj, .prj and .shx files',
              type: 'string',
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
