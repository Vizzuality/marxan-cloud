import {
  forwardRef,
  HttpService,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Readable } from 'stream';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { forbiddenError } from '@marxan-api/modules/access-control';
import { assertDefined } from '@marxan/utils';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { ScenariosService } from '@marxan-api/modules/scenarios/scenarios.service';
import { GetScenarioFailure } from '@marxan-api/modules/blm/values/blm-repos';

export const unknownPdfWebshotError = Symbol(`unknown pdf webshot error`);

export class WebshotViewport {
  @ApiPropertyOptional()
  @IsNumber()
  @Min(64)
  @Max(1920)
  width!: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(64)
  @Max(1080)
  height!: number;
}

export class WebshotSummaryReportConfig {
  @ApiProperty()
  @IsString()
  baseUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  viewport?: WebshotViewport;

  @ApiPropertyOptional()
  @IsOptional()
  cookie?: string;
}

@Injectable()
export class WebshotService {
  private webshotServiceUrl: string = AppConfig.get('webshot.url') as string;
  private readonly logger = new Logger(WebshotService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => ScenariosService))
    private readonly scenariosService: ScenariosService,
  ) {}

  async getSummaryReportForScenario(
    scenarioId: string,
    authenticatedUser: Pick<User, 'id'>,
    config: WebshotSummaryReportConfig,
  ): Promise<
    Either<
      | typeof unknownPdfWebshotError
      | GetScenarioFailure
      | typeof forbiddenError,
      Readable
    >
  > {
    try {
      assertDefined(authenticatedUser);
      const scenario = await this.scenariosService.getById(scenarioId, {
        authenticatedUser,
      });
      if (isLeft(scenario)) {
        return scenario;
      }

      const pdfBuffer = await this.httpService
        .post(
          `${this.webshotServiceUrl}/projects/${scenario.right.projectId}/scenarios/${scenarioId}/solutions/report`,
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
