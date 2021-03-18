import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ProtectedAreaResult } from './protected-area.geo.entity';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import {
  protectedAreaResource,
  ProtectedAreasService,
} from './protected-areas.service';
import { IUCNProtectedAreaCategoryResult } from './dto/iucn-protected-area-category.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(protectedAreaResource.className)
@Controller(`${apiGlobalPrefixes.v1}/protected-areas`)
export class ProtectedAreasController {
  constructor(public readonly service: ProtectedAreasService) {}

  @Get('iucn-categories')
  async listProtectedAreaCategories(): Promise<Array<string | undefined>> {
    return await this.service.listProtectedAreaCategories();
  }

  @ApiOperation({
    description:
      'Find unique IUCN categories among protected areas in a single given administrative area.',
  })
  @ApiParam({
    name: 'adminAreaId',
    description:
      'Only protected areas within the given admin area will be considered.',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: IUCNProtectedAreaCategoryResult,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get('iucn-categories/:adminAreaId')
  async listIUCNProtectedAreaCategories(
    @Param('adminAreaId') adminAreaId: string,
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<IUCNProtectedAreaCategoryResult[]> {
    return await this.service.findAllProtectedAreaCategories(
      fetchSpecification,
      undefined,
      {
        adminAreaId,
      },
    );
  }
}
