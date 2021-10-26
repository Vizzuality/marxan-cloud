import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JSONAPIQueryParams } from '@marxan-api/decorators/json-api-parameters.decorator';
import { XApiGuard } from '@marxan-api/guards/x-api.guard';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

import { DeleteResult } from 'typeorm';

import { ApiEvent, ApiEventResult } from './api-event.api.entity';
import { ApiEventsService } from './api-events.service';
import { CreateApiEventDTO } from './dto/create.api-event.dto';
import { API_EVENT_KINDS } from '@marxan/api-events';

@Controller(`${apiGlobalPrefixes.v1}/api-events`)
@UseGuards(XApiGuard)
@ApiTags('ApiEvents')
@ApiBearerAuth()
export class ApiEventsController {
  constructor(public service: ApiEventsService) {}

  @ApiOperation({
    description: 'Find all API events',
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

  @ApiOperation({
    description: 'Find latest API event by kind for a given topic',
  })
  @ApiOkResponse({ type: ApiEvent })
  @Get('kind/:kind/topic/:topic/latest')
  async findLatestEventByKindAndTopic(
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
  async create(@Body() dto: CreateApiEventDTO): Promise<ApiEventResult> {
    return await this.service.serialize(await this.service.create(dto));
  }

  @ApiOperation({
    description: 'Delete API event series by kind for a given topic',
  })
  @ApiOkResponse({ type: ApiEvent })
  @Delete('kind/:kind/topic/:topic')
  async deleteEventSeriesByKindAndTopic(
    @Param('kind') kind: API_EVENT_KINDS,
    @Param('topic') topic: string,
  ): Promise<DeleteResult> {
    return await this.service.purgeAll({ kind, topic });
  }
}
