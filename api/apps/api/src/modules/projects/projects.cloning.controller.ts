import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadOptions } from '@marxan-api/utils/file-uploads.utils';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  notAllowed,
  projectNotFound,
  ProjectsService,
} from './projects.service';
import { isLeft } from 'fp-ts/Either';
import { forbiddenError } from '@marxan-api/modules/access-control';
import { Response } from 'express';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';
import {
  GetLatestExportResponseDto,
  GetLatestExportsResponseDto,
  RequestProjectCloneResponseDto,
  RequestProjectExportBodyDto,
  RequestProjectExportResponseDto,
  RequestProjectImportBodyDto,
  RequestProjectImportResponseDto,
} from './dto/cloning.project.dto';
import {
  cloningExportProvided,
  invalidExportZipFile,
} from '../clone/infra/import/generate-export-from-zip-file.command';
import {
  integrityCheckFailed,
  invalidSignature,
} from '../clone/export/application/manifest-file-service.port';
import {
  exportNotFound,
  unfinishedExport,
} from '../clone/export/application/get-archive.query';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Project - cloning')
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectCloningController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ImplementsAcl()
  @ApiOperation({
    description: `Request the preparation of a downloadable export for the project.`,
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: RequestProjectExportResponseDto })
  @Post(`:projectId/export`)
  async requestProjectExport(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() dto: RequestProjectExportBodyDto,
  ) {
    const result = await this.projectsService.requestExport(
      projectId,
      req.user.id,
      dto.scenarioIds,
      false,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case projectNotFound:
          throw new NotFoundException(
            `Could not find project with ID: ${projectId}`,
          );

        default:
          throw new InternalServerErrorException();
      }
    }
    return {
      id: result.right.exportId.value,
    };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: `Request a clone of the project to be created.`,
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: RequestProjectCloneResponseDto })
  @Post(`:projectId/clone`)
  async requestProjectClone(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Body() dto: RequestProjectExportBodyDto,
  ): Promise<RequestProjectCloneResponseDto> {
    const result = await this.projectsService.requestExport(
      projectId,
      req.user.id,
      dto.scenarioIds,
      true,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case projectNotFound:
          throw new NotFoundException(
            `Could not find project with ID: ${projectId}`,
          );

        default:
          throw new InternalServerErrorException();
      }
    }

    return {
      exportId: result.right.exportId.value,
      projectId: result.right.importResourceId!.value,
    };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: `Download a prepared export of the project.`,
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID of the Project',
  })
  @ApiParam({
    name: 'exportId',
    description: 'ID of the Export',
  })
  @Get(`:projectId/export/:exportId`)
  @Header(`Content-Type`, `application/zip`)
  @Header('Content-Disposition', 'attachment; filename="export.zip"')
  async getProjectExportArchive(
    @Param('projectId') projectId: string,
    @Param('exportId') exportId: string,
    @Res() response: Response,
    @Req() req: RequestWithAuthenticatedUser,
  ) {
    const result = await this.projectsService.getExportedArchive(
      projectId,
      req.user.id,
      exportId,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case unfinishedExport:
          throw new BadRequestException(
            `Export with ID ${exportId} hasn't finished`,
          );
        case notAllowed:
          throw new ForbiddenException(
            `Your role cannot retrieve export .zip files for project with ID: ${projectId}`,
          );
        case projectNotFound:
          throw new NotFoundException(
            `Could not find project with ID: ${projectId}`,
          );
        case exportNotFound:
          throw new NotFoundException(
            `Could not find export with ID: ${exportId}`,
          );

        default:
          throw new InternalServerErrorException();
      }
    }

    result.right.pipe(response);
  }

  @ImplementsAcl()
  @ApiOperation({
    description:
      'Return the exportId of the most recently prepared export for a given project',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: GetLatestExportResponseDto })
  @Get(`:projectId/export`)
  async getLatestExportId(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<GetLatestExportResponseDto> {
    const resultOrError = await this.projectsService.getLatestExportForProject(
      projectId,
      req.user.id,
    );

    if (isLeft(resultOrError)) {
      switch (resultOrError.left) {
        case exportNotFound:
          throw new NotFoundException(
            `Export for project with id ${projectId} not found`,
          );
        case forbiddenError:
          throw new ForbiddenException();
        default:
          throw new InternalServerErrorException();
      }
    }
    return resultOrError.right;
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'List the latest exports for a given project',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID of the Project',
  })
  @ApiOkResponse({ type: GetLatestExportsResponseDto })
  @Get(`:projectId/latest-exports`)
  async getLatestExports(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<GetLatestExportsResponseDto> {
    const resultOrError = await this.projectsService.getLatestExportsForProject(
      projectId,
      req.user.id,
    );

    if (isLeft(resultOrError)) {
      switch (resultOrError.left) {
        case exportNotFound:
          throw new NotFoundException(
            `Export for project with id ${projectId} not found`,
          );
        case forbiddenError:
          throw new ForbiddenException();
        default:
          throw new InternalServerErrorException();
      }
    }
    return { exports: resultOrError.right };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: `Import a project from a downloaded export artifact.`,
  })
  @Post('import')
  @ApiOkResponse({ type: RequestProjectImportResponseDto })
  @ApiConsumes('multipart/form-data')
  /**
   * Marxan Cloud archives can get rather big. Let's aim for a limit of 50MB for
   * the time being. This may need to be raised in the future, but if doing so,
   * the system should be diligently stress-tested to make sure we can actually
   * handle bigger archives, which may came with their own set of additional
   * challenges.
   */
  @UseInterceptors(
    FileInterceptor('file', { limits: uploadOptions(50 * 1024 ** 2).limits }),
  )
  async importProject(
    @Body() dto: RequestProjectImportBodyDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<RequestProjectImportResponseDto> {
    const idsOrError = await this.projectsService.importProjectFromZipFile(
      file,
      req.user.id,
      dto.projectName,
    );

    if (isLeft(idsOrError)) {
      switch (idsOrError.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case invalidSignature:
        case integrityCheckFailed:
        case cloningExportProvided:
        case invalidExportZipFile:
          throw new BadRequestException('Invalid export zip file');
        default:
          throw new InternalServerErrorException(idsOrError.left);
      }
    }

    return {
      importId: idsOrError.right.importId,
      projectId: idsOrError.right.projectId,
    };
  }
}
