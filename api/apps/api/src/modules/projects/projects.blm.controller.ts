import {
  BadRequestException,
  Body,
  Controller, ForbiddenException,
  Get, InternalServerErrorException,
  NotFoundException,
  Param, Patch, Req, UseGuards
} from '@nestjs/common';

import { projectResource } from './project.api.entity';
import {
  ApiBearerAuth, ApiOkResponse,
  ApiOperation,
  ApiParam, ApiTags
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  ProjectsService
} from './projects.service';
import { isLeft } from 'fp-ts/Either';
import { inlineJobTag } from '@marxan-api/dto/inline-job-tag';
import { UpdateProjectBlmRangeDTO } from '@marxan-api/modules/projects/dto/update-project-blm-range.dto';
import { invalidRange } from '@marxan-api/modules/projects/blm';
import {
  planningUnitAreaNotFound,
  updateFailure,
} from '@marxan-api/modules/projects/blm/change-project-blm-range.command';
import { ProjectBlmValuesResponseDto } from '@marxan-api/modules/projects/dto/project-blm-values-response.dto';
import { forbiddenError } from '@marxan-api/modules/access-control';
import {
  projectNotFound as blmProjectNotFound,
  unknownError as blmUnknownError,
} from '../blm';
import {
  ImplementsAcl
} from '@marxan-api/decorators/acl.decorator';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Project - BLM')
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectBLMController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @ImplementsAcl()
  @ApiOperation({
    description: 'Updates the project BLM range and calculate its values',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: ProjectBlmValuesResponseDto })
  @ApiTags(inlineJobTag)
  @Patch(':id/calibration')
  async updateBlmRange(
    @Param('id') id: string,
    @Body() { range }: UpdateProjectBlmRangeDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectBlmValuesResponseDto> {
    const result = await this.projectsService.updateBlmValues(
      id,
      req.user.id,
      range,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case invalidRange:
          throw new BadRequestException(`Invalid range: ${range}`);
        case planningUnitAreaNotFound:
          throw new NotFoundException(
            `Could not find project BLM values for project with ID: ${id}`,
          );
        case updateFailure:
          throw new InternalServerErrorException(
            `Could not update with range ${range} project BLM values for project with ID: ${id}`,
          );
        case forbiddenError:
          throw new ForbiddenException();
        default:
          throw new InternalServerErrorException();
      }
    }

    return result.right;
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Shows the project BLM values of a project',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: ProjectBlmValuesResponseDto })
  @ApiTags(inlineJobTag)
  @Get(':id/calibration')
  async getProjectBlmValues(
    @Param('id') id: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectBlmValuesResponseDto> {
    const result = await this.projectsService.findProjectBlm(id, req.user.id);

    if (isLeft(result))
      switch (result.left) {
        case blmProjectNotFound:
          throw new NotFoundException(
            `Could not find project BLM values for project with ID: ${id}`,
          );
        case forbiddenError:
          throw new ForbiddenException();
        case blmUnknownError:
          throw new InternalServerErrorException();
        default:
          const _exhaustiveCheck: never = result.left;
          throw _exhaustiveCheck;
      }
    return result.right;
  }
}
