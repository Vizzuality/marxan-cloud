import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Scenario, ScenarioResult } from './scenario.entity';
import { ScenariosService } from './scenarios.service';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { Post } from '@nestjs/common';

import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { BaseServiceResource } from 'types/resource.interface';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';

const resource: BaseServiceResource = {
  className: 'Scenario',
  name: {
    singular: 'scenario',
    plural: 'scenarios',
  },
};

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(resource.className)
@Controller(`${apiGlobalPrefixes.v1}/scenarios`)
export class ScenariosController {
  constructor(public readonly service: ScenariosService) {}

  @ApiOperation({
    description: 'Find all scenarios',
  })
  @ApiOkResponse({
    type: Scenario,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    description:
      'The current user does not have suitable permissions for this request.',
  })
  @JSONAPIQueryParams()
  @Get()
  async findAll(): Promise<Scenario[]> {
    return this.service.serialize(await this.service.findAll());
  }

  @ApiOperation({ description: 'Find scenario by id' })
  @ApiOkResponse({ type: ScenarioResult })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Scenario> {
    return await this.service.serialize([await this.service.fakeFindOne(id)]);
  }

  @ApiOperation({ description: 'Create scenario' })
  @ApiCreatedResponse({ type: ScenarioResult })
  @Post()
  async create(
    @Body(new ValidationPipe()) dto: CreateScenarioDTO,
  ): Promise<ScenarioResult> {
    return await this.service.serialize([await this.service.fakeFindOne('id')]);
  }

  @ApiOperation({ description: 'Update scenario' })
  @ApiOkResponse({ type: ScenarioResult })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: UpdateScenarioDTO,
  ): Promise<ScenarioResult> {
    return await this.service.serialize([await this.service.fakeFindOne('id')]);
  }

  @ApiOperation({ description: 'Delete scenario' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.service.remove(id);
  }
}
