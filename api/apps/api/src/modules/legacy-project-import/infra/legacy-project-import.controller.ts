import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { XApiGuard } from '@marxan-api/guards/x-api.guard';
import { ResourceId } from '@marxan/cloning/domain';
import {
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { isLeft } from 'fp-ts/lib/Either';
import { asyncJobTag } from '../../../dto/async-job-tag';
import { internalError } from '../../specification/application/submit-specification.command';
import { LaunchLegacyProjectImportSpecification } from '../application/launch-legacy-project-import-specification.command';
import { legacyProjectImportNotFound } from '../domain/legacy-project-import/legacy-project-import.repository';
import { LaunchLegacyProjectImportSpecificationDto } from './dto/launch-legacy-project-import-specification.dto';

@UseGuards(XApiGuard)
@Controller(`${apiGlobalPrefixes.v1}/projects/import/legacy`)
export class LegacyProjectImportController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    description: 'Create feature set for scenario of a legacy project import',
  })
  @ApiTags(asyncJobTag)
  @Post(':projectId/specification')
  async launchLegacyProjectImportSpecification(
    @Body(new ValidationPipe()) dto: LaunchLegacyProjectImportSpecificationDto,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new LaunchLegacyProjectImportSpecification(
        new ResourceId(projectId),
        dto.features,
      ),
    );

    if (isLeft(result)) {
      switch (result.left) {
        case legacyProjectImportNotFound:
          throw new NotFoundException(
            `Legacy project import with project id ${projectId} not found`,
          );
        case internalError:
        default:
          throw new InternalServerErrorException();
      }
    }
  }
}
