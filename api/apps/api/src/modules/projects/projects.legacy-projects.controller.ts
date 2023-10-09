import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  uploadOptions,
} from '@marxan-api/utils/file-uploads.utils';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import {
  ProjectsService,
} from './projects.service';
import { isLeft } from 'fp-ts/Either';
import { forbiddenError } from '@marxan-api/modules/access-control';
import {
  ImplementsAcl,
} from '@marxan-api/decorators/acl.decorator';
import {
  AddFileToLegacyProjectImportBodyDto,
  AddFileToLegacyProjectImportResponseDto,
  DeleteFileFromLegacyProjectImportResponseDto,
  GetLegacyProjectImportErrorsResponseDto,
  RunLegacyProjectImportBodyDto,
  RunLegacyProjectImportResponseDto,
  StartLegacyProjectImportBodyDto,
  StartLegacyProjectImportResponseDto,
} from './dto/legacy-project-import.dto';
import {
  legacyProjectImportAlreadyFinished,
  legacyProjectImportAlreadyStarted,
  legacyProjectImportMissingRequiredFile,
} from '../legacy-project-import/domain/legacy-project-import/legacy-project-import';
import {
  legacyProjectImportNotFound,
  legacyProjectImportSaveError,
} from '../legacy-project-import/domain/legacy-project-import/legacy-project-import.repository';
import { updateSolutionsAreLockFailed } from '../legacy-project-import/application/update-solutions-are-locked-to-legacy-project-import.command';
import { blmCreationFailure } from '../scenarios/blm-calibration/create-initial-scenario-blm.command';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Legacy projects')
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class LegacyProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @ImplementsAcl()
  @ApiOperation({
    description: 'Starts a legacy marxan project import process',
    summary: 'Starts a legacy marxan project import process',
  })
  @ApiOkResponse({ type: StartLegacyProjectImportResponseDto })
  @Post('import/legacy')
  async importLegacyProject(
    @Body() dto: StartLegacyProjectImportBodyDto,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<StartLegacyProjectImportResponseDto> {
    const result = await this.projectsService.startLegacyProjectImport(
      dto.projectName,
      req.user.id,
      dto.description,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        default:
          throw new InternalServerErrorException();
      }
    }

    return {
      projectId: result.right.projectId.value,
      scenarioId: result.right.scenarioId.value,
    };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Cancel a legacy project import',
    summary: 'Cancel a legacy project import',
  })
  @ApiOkResponse({ type: RunLegacyProjectImportResponseDto })
  @Post('import/legacy/:projectId/cancel')
  async cancelLegacyProject(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<RunLegacyProjectImportResponseDto> {
    const result = await this.projectsService.cancelLegacyProject(
      projectId,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case legacyProjectImportNotFound:
          throw new NotFoundException();
        case legacyProjectImportAlreadyFinished:
          throw new BadRequestException(
            `legacy project import with ${projectId} has already finished`,
          );
        case legacyProjectImportSaveError:
        default:
          throw new InternalServerErrorException();
      }
    }

    return { projectId };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Runs a legacy project import',
    summary: 'Runs a legacy project import',
  })
  @ApiOkResponse({ type: RunLegacyProjectImportResponseDto })
  @Post('import/legacy/:projectId')
  async runLegacyProject(
    @Param('projectId') projectId: string,
    @Body() dto: RunLegacyProjectImportBodyDto,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<RunLegacyProjectImportResponseDto> {
    const result = await this.projectsService.runLegacyProject(
      projectId,
      dto.solutionsAreLocked,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case legacyProjectImportNotFound:
          throw new NotFoundException();
        case legacyProjectImportMissingRequiredFile:
          throw new BadRequestException(
            'missing required files for running a legacy project import',
          );
        case legacyProjectImportAlreadyStarted:
          throw new BadRequestException(
            'a run has already being made on this legacy project import',
          );
        case legacyProjectImportSaveError:
        case updateSolutionsAreLockFailed:
        case blmCreationFailure:
        default:
          throw new InternalServerErrorException();
      }
    }

    return { projectId };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Returns legacy project import errors and warnings',
    summary: 'Returns legacy project import errors and warnings',
  })
  @ApiOkResponse({ type: GetLegacyProjectImportErrorsResponseDto })
  @Get('import/legacy/:projectId/validation-results')
  async getLegacyProjectImportErrors(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<GetLegacyProjectImportErrorsResponseDto> {
    const result = await this.projectsService.getLegacyProjectImportErrors(
      projectId,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case legacyProjectImportNotFound:
          throw new NotFoundException();
        default:
          throw new InternalServerErrorException();
      }
    }

    return { errorsAndWarnings: result.right };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Adds a file to a legacy project import',
    summary: 'Adds a file to a legacy project import',
  })
  @Post('import/legacy/:projectId/data-file')
  @ApiOkResponse({ type: AddFileToLegacyProjectImportResponseDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: uploadOptions().limits }))
  async addFileToLegacyProjectImport(
    @Body() dto: AddFileToLegacyProjectImportBodyDto,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<AddFileToLegacyProjectImportResponseDto> {
    const result = await this.projectsService.addFileToLegacyProjectImport(
      projectId,
      file,
      dto.fileType,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case legacyProjectImportNotFound:
          throw new NotFoundException();
        case legacyProjectImportAlreadyStarted:
          throw new BadRequestException(
            `Legacy project import with project ID ${projectId} has already started`,
          );
        case legacyProjectImportSaveError:
        default:
          throw new InternalServerErrorException();
      }
    }

    return { projectId, fileId: result.right.value };
  }

  @ImplementsAcl()
  @ApiOperation({
    description: 'Deletes a file from a legacy project import',
    summary: 'Deletes a file from a legacy project import',
  })
  @Delete('import/legacy/:projectId/data-file/:dataFileId')
  @ApiOkResponse({ type: DeleteFileFromLegacyProjectImportResponseDto })
  async deleteFileFromLegacyProjectImport(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('dataFileId', ParseUUIDPipe) dataFileId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<DeleteFileFromLegacyProjectImportResponseDto> {
    const result = await this.projectsService.deleteFileFromLegacyProjectImport(
      projectId,
      dataFileId,
      req.user.id,
    );

    if (isLeft(result)) {
      switch (result.left) {
        case forbiddenError:
          throw new ForbiddenException();
        case legacyProjectImportNotFound:
          throw new NotFoundException();
        case legacyProjectImportAlreadyStarted:
          throw new BadRequestException(
            `Legacy project import with project ID ${projectId} has already started`,
          );
        default:
          throw new InternalServerErrorException();
      }
    }

    return { projectId };
  }
}
