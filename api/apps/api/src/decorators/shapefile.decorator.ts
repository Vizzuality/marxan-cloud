import { isDefined } from '@marxan/utils';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiResponseMetadata,
} from '@nestjs/swagger';

import { ShapefileGeoJSONResponseDTO } from '@marxan-api/modules/scenarios/dto/shapefile.geojson.response.dto';

export function ApiConsumesShapefile(
  options: {
    withGeoJsonResponse?: boolean;
    type?: ApiResponseMetadata['type'];
    description?: ApiResponseMetadata['description'];
  } = {},
) {
  options = Object.assign({}, options, {
    withGeoJsonResponse: true,
    type: ShapefileGeoJSONResponseDTO,
    description: 'Upload Zip file containing .shp, .dbj, .prj and .shx files',
  });
  return applyDecorators(
    ...[
      ApiOperation({
        description: options.description,
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
      options.withGeoJsonResponse
        ? ApiOkResponse({ type: options.type })
        : undefined,
    ].filter(isDefined),
  );
}
