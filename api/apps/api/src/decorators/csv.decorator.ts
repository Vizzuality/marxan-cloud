import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { isDefined } from 'tiny-types';

export function ApiConsumesCsv(options: { shape?: any; description?: string }) {
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
              description: 'CSV file',
              type: 'string',
              format: 'binary',
            },
          },
        },
      }),
      ApiOkResponse(),
      ApiBadRequestResponse,
    ].filter(isDefined),
  );
}
