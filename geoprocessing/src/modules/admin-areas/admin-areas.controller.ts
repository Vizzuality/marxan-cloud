import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminAreasResult } from './admin-areas.geo.entity';
import { AdminAreasServer } from './admin-areas.service';
import {
  //ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
//import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import { BaseServiceResource } from 'types/resource.interface';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

const resource: BaseServiceResource = {
  className: 'AdminArea',
  name: {
    singular: 'admin_area',
    plural: 'admin_areas',
  },
};

//@UseGuards(JwtAuthGuard)
//@ApiBearerAuth()
// @ApiTags(resource.className)
// @Controller(`${apiGlobalPrefixes.v1}`)
// export class AdminAreasController {
//   constructor( public service: AdminAreasServer) {}

//   @ApiOperation({
//     description: 'Get administrative areas within a given country.',
//   })
// }
