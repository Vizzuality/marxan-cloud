import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
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
import { RequestWithAuthenticatedUser } from 'app.controller';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

import { DeleteResult } from 'typeorm';

import {
  API_EVENT_KINDS,
  ApiEventResult,
  ApiEvent,
} from './api-event.api.entity';
import { ApiEventsService } from './api-events.service';
import { CreateApiEventDTO } from './dto/create.api-event.dto';

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

  @ApiOperation({ description: 'Find latest event by kind for a given topic' })
  @ApiOkResponse({ type: ApiEvent })
  @Get('kind/:kind/topic/:topic/latest')
  async findOne(
    @Param('kind') kind: API_EVENT_KINDS,
    @Param('topic') topic: string,
  ): Promise<ApiEventResult> {
    return await this.service.serialize(
      (await this.service.getLatestEventForTopic({ topic, kind })) as ApiEvent,
    );
  }

  @ApiOperation({ description: 'Create an API event' })
  @ApiOkResponse({ type: ApiEvent })
  @Post()
  async create(
    @Body() dto: CreateApiEventDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ApiEventResult> {
    return await this.service.serialize(
      await this.service.create(dto, { authenticatedUser: req.user }),
    );
  }

  @Post('purge-all')
  @ApiOperation({ summary: 'Purge events' })
  @ApiResponse({ status: 201, description: 'Events invalidated' })
  @ApiQuery({
    name: 'topic',
    type: String,
    description:
      'Topic of an event series (topic, kind) whose events should be purged. Both topic and kind must be provided in order to purge events for an event series (i.e. topic of a specific kind). If no event series data is provided, purge all events.',
    required: false,
  })
  @ApiQuery({
    name: 'kind',
    type: String,
    description:
      'Kind of an event series (topic, kind) whose events should be purged',
    required: false,
  })
  async purgeAll(
    @Query('topic') topic: string,
    @Query('kind') kind: API_EVENT_KINDS,
  ): Promise<DeleteResult> {
    // Poor person's dependent typing
    if ((topic || kind) && !(topic && kind)) {
      throw new BadRequestException(
        `When requesting to purge events for an event series, both topic and kind parameters must be provided. Values in the current request were: topic=${topic}, kind=${kind}`,
      );
    }
    return await this.service.purgeAll({
      topic,
      kind,
    });
  }
}
