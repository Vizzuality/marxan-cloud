import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Project, ProjectResult } from './project.api.entity';
import { ProjectsService } from './projects.service';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
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
import { CreateProjectDTO } from './dto/create.project.dto';
import { RequestWithAuthenticatedUser } from 'app.controller';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

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
  @ApiOkResponse({ type: ProjectResult })
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ProjectResult> {
    const results = await this.service.findAllPaginated(fetchSpecification);
    return await this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find project by id' })
  @ApiOkResponse({ type: ProjectResult })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProjectResult> {
    return await this.service.serialize(await this.service.getById(id));
  }

  @ApiOperation({ description: 'Create project' })
  @ApiOkResponse({ type: ProjectResult })
  @Post()
  async create(
    @Body(new ValidationPipe()) dto: CreateProjectDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ProjectResult> {
    return await this.service.serialize(
      await this.service.create(dto, { authenticatedUser: req.user }),
    );
  }

  @ApiOperation({ description: 'Update project' })
  @ApiOkResponse({ type: ProjectResult })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: UpdateProjectDTO,
  ): Promise<ProjectResult> {
    return await this.service.serialize(await this.service.update(id, dto));
  }

  @ApiOperation({ description: 'Delete project' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.service.remove(id);
  }
}
