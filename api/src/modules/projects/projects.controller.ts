import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Project, ProjectResult } from './project.api.entity';
import { ProjectsService } from './projects.service';

import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from 'api.config';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { Post } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadOptions } from 'utils/file-uploads.utils';

import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import { BaseServiceResource } from 'types/resource.interface';
import { UpdateProjectDTO } from './dto/update.project.dto';

const resource: BaseServiceResource = {
  className: 'Project',
  name: {
    singular: 'project',
    plural: 'projects',
  },
};

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags(resource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectsController {
  constructor(public readonly service: ProjectsService) {}

  /**
   * Import a Marxan legacy project via file upload
   *
   * @debt We may want to use a custom interceptor to process import files
   */
  @ApiOperation({
    description: 'Import a Marxan project via file upload',
    summary: 'Import a Marxan project',
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @Post('legacy')
  async importLegacyProject(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Project> {
    return this.service.importLegacyProject(file);
  }

  @ApiOperation({
    description: 'Find all projects',
  })
  @ApiOkResponse({
    type: Project,
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
  async findAll(): Promise<Project[]> {
    return this.service.serialize(await this.service.findAll());
  }

  @ApiOperation({ description: 'Find project by id' })
  @ApiOkResponse({ type: ProjectResult })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project> {
    return await this.service.serialize([await this.service.fakeFindOne(id)]);
  }
}
