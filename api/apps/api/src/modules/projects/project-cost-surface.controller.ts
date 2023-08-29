import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { projectResource } from '@marxan-api/modules/projects/project.api.entity';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { ApiConsumesShapefile } from '@marxan-api/decorators/shapefile.decorator';
import {
  GeometryFileInterceptor,
  GeometryKind,
} from '@marxan-api/decorators/file-interceptors.decorator';
import { asyncJobTag } from '@marxan-api/dto/async-job-tag';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { isLeft } from 'fp-ts/Either';
import { mapAclDomainToHttpError } from '@marxan-api/utils/acl.utils';
import { scenarioResource } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ScenariosService } from '@marxan-api/modules/scenarios/scenarios.service';
import { CostRangeDto } from '@marxan-api/modules/scenarios/dto/cost-range.dto';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';
import { CostSurfaceService } from '@marxan-api/modules/cost-surface/cost-surface.service';
import { UploadCostSurfaceShapefileDto } from '@marxan-api/modules/cost-surface/dto/upload-cost-surface-shapefile.dto';
import {
  AsyncJobDto,
  JsonApiAsyncJobMeta,
} from '@marxan-api/dto/async-job.dto';
import { ensureShapefileHasRequiredFiles } from '@marxan-api/utils/file-uploads.utils';

@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectCostSurfaceController {
  constructor(
    @Inject(forwardRef(() => ScenariosService))
    public readonly scenarioService: ScenariosService,
    public readonly costSurfaceService: CostSurfaceService,
  ) {}

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'To be implemented' })
  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @GeometryFileInterceptor(GeometryKind.Complex)
  @ApiTags(asyncJobTag)
  @Post(`:projectId/cost-surface/shapefile`)
  async processCostSurfaceShapefile(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCostSurfaceShapefileDto,
  ): Promise<JsonApiAsyncJobMeta> {
    await ensureShapefileHasRequiredFiles(file);

    const result = await this.costSurfaceService.uploadCostSurfaceShapefile(
      req.user.id,
      projectId,
      dto,
      file,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        projectId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return AsyncJobDto.forProject().asJsonApiMetadata();
  }

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @Get(`:projectId/cost-surface/:costSurfaceId/cost-range`)
  @ApiOkResponse({ type: CostRangeDto })
  async getCostRange(
    @Param('scenarioId') scenarioId: string,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<CostRangeDto> {
    const result = await this.scenarioService.getCostRange(
      scenarioId,
      req.user.id,
    );
    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
    return plainToClass<CostRangeDto, CostRangeDto>(CostRangeDto, result.right);
  }
}
