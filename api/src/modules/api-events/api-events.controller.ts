import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

import { DeleteResult } from 'typeorm';

import {
  API_EVENT_APIVERSIONS,
  API_EVENT_KINDS,
  ApiEventResult,
} from './api-event.api.entity';
import { ApiEventsService } from './api-events.service';

@Controller(`${apiGlobalPrefixes.v1}/api-events`)
@UseGuards(AuthGuard('jwt'))
@ApiTags('ApiEvents')
@ApiBearerAuth()
export class ApiEventsController {
  constructor(public service: ApiEventsService) {}

  @ApiOperation({
    description: 'Find all countries',
  })
  @ApiOkResponse({
    type: ApiEventResult,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ApiEventResult> {
    const results = await this.service.findAllPaginated(fetchSpecification);
    return this.service.serialize(results.data, results.metadata);
  }

  @Post('purge-all')
  @ApiOperation({ summary: 'Purge events' })
  @ApiResponse({ status: 201, description: 'Events invalidated' })
  @ApiQuery({
    name: 'topic',
    type: String,
    description:
      'Topic of a qualified topic (topic, kind, apiVersion) triplet whose events should be purged. All of topic, kind and apiVersion must be provided in order to purge events for a qualified topic (i.e. topic of a specific kind and version. If no qualified topic data is provided, purge all events.',
    required: false,
  })
  @ApiQuery({
    name: 'kind',
    type: String,
    description:
      'Kind of a qualified topic (topic, kind, apiVersion) triplet whose events should be purged',
    required: false,
  })
  @ApiQuery({
    name: 'apiVersion',
    type: String,
    description:
      'ApiVersion of a qualified topic (topic, kind, apiVersion) triplet whose events should be purged',
    required: false,
  })
  async purgeAll(
    @Query('topic') topic: string,
    @Query('kind') kind: string,
    @Query('apiVersion') apiVersion: string,
  ): Promise<DeleteResult> {
    // Poor person's dependent typing
    if ((topic || kind || apiVersion) && !(topic && kind && apiVersion)) {
      throw new BadRequestException(
        `When requesting to purge events for a qualified topic, all of topic, kind and apiVersion parameters must be provided. Values in the current request were: topic=${topic}, kind=${kind}, apiVersion=${apiVersion}`,
      );
    }
    return await this.service.purgeAll({
      topic,
      kind: kind as API_EVENT_KINDS,
      apiVersion: apiVersion as API_EVENT_APIVERSIONS,
    });
  }
}
