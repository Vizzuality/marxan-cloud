import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Readable } from 'stream';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScenarioAccessControl } from '@marxan-api/modules/access-control/scenarios-acl/scenario-access-control';
import { forbiddenError } from '@marxan-api/modules/access-control';
import { assertDefined } from '@marxan/utils';
import { User } from '../users/user.api.entity';
import { Either, left, right } from 'fp-ts/lib/Either';

export const unknownPdfWebshotError = Symbol(`unknown pdf webshot error`);

export class WebshotViewport {
  @IsNumber()
  @Min(64)
  @Max(1920)
  width!: number;

  @IsNumber()
  @Min(64)
  @Max(1080)
  height!: number;
}

export class WebshotSummaryReportConfig {
  @IsString()
  baseUrl!: string;

  @IsOptional()
  viewport?: WebshotViewport;

  @IsOptional()
  cookie?: string;
}

@Injectable()
export class WebshotService {
  private webshotServiceUrl: string = AppConfig.get('webshot.url') as string;
  private readonly logger = new Logger(WebshotService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly scenarioAclService: ScenarioAccessControl,
  ) {}

  async getSummaryReportForScenario(
    projectId: string,
    scenarioId: string,
    authenticatedUser: Pick<User, 'id'>,
    config: WebshotSummaryReportConfig,
  ): Promise<
    Either<typeof unknownPdfWebshotError | typeof forbiddenError, Readable>
  > {
    try {
      assertDefined(authenticatedUser);
      if (
        !(await this.scenarioAclService.canViewScenario(
          authenticatedUser.id,
          scenarioId,
        ))
      ) {
        return left(forbiddenError);
      }

      const pdfBuffer = await this.httpService
        .post(
          `${this.webshotServiceUrl}/projects/${projectId}/scenarios/${scenarioId}/solutions/report`,
          config,
          { responseType: 'arraybuffer' },
        )
        .toPromise()
        .then((response) => response.data)
        .catch((error) => {
          throw new Error(error);
        });

      const stream = new Readable();

      stream.push(pdfBuffer);
      stream.push(null);

      return right(stream);
    } catch (error) {
      return left(unknownPdfWebshotError);
    }
  }
}
