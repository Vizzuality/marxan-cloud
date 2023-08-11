import {
  Controller,
  forwardRef,
  Get,
  Header,
  Inject,
  NotImplementedException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
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
import { Response } from 'express';
import { marxanRunFiles } from '@marxan-api/modules/scenarios/scenarios.controller';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';
import { ImplementsAcl } from '@marxan-api/decorators/acl.decorator';

@ApiTags(projectResource.className)
@Controller(`${apiGlobalPrefixes.v1}/projects`)
export class ProjectCostSurfaceController {
  constructor(
    @Inject(forwardRef(() => ScenariosService))
    public readonly scenarioService: ScenariosService,
  ) {}

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'To be implemented' })
  @ApiConsumesShapefile({ withGeoJsonResponse: false })
  @GeometryFileInterceptor(GeometryKind.ComplexWithProperties)
  @ApiTags(asyncJobTag)
  @Post(`:projectId/cost-surface/shapefile`)
  async processCostSurfaceShapefile(
    @Param(':projectId') projectId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<NotImplementedException> {
    /**
     * @todo: We will have to move ScenarioService.processCostSurfaceShapefile logic to another project-scoped
     *        service and fire it from here.
     */
    throw new NotImplementedException();
  }

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @Get(`:scenarioId/cost-surface`)
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

  @ImplementsAcl()
  @UseGuards(JwtAuthGuard)
  @ApiTags(marxanRunFiles)
  @Header('Content-Type', 'text/csv')
  @ApiOkResponse({
    schema: {
      type: 'string',
    },
  })
  @ApiOperation({
    description: `Uploaded cost surface data`,
  })
  @Get(`:scenarioId/marxan/dat/pu.dat`)
  async getScenarioCostSurface(
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Req() req: RequestWithAuthenticatedUser,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.scenarioService.getCostSurfaceCsv(
      scenarioId,
      req.user.id,
      res,
    );

    if (isLeft(result)) {
      throw mapAclDomainToHttpError(result.left, {
        scenarioId,
        userId: req.user.id,
        resourceType: scenarioResource.name.plural,
      });
    }
  }
}
