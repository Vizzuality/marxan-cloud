import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
  QualifiedEventTopic,
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
  async create(
    @Body() dto: CreateApiEventDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ApiEventResult> {
    return await this.service.serialize(
      await this.service.create(dto, { authenticatedUser: req.user }),
    );
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
    return await this.service.purgeAll({ kind, topic } as QualifiedEventTopic);
  }
}
