import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ShapefileGeoJSONResponseDTO } from '../types/shapefile.geojson.response.dto';

export function ApiConsumesShapefile() {
  return applyDecorators(
    ApiOperation({
      description: 'Upload Zip file containing .shp, .dbj, .prj and .shx files',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            description: 'Zip file containing .shp, .dbj, .prj and .shx files',
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiOkResponse({ type: ShapefileGeoJSONResponseDTO }),
  );
}
