import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiEventJobStatus } from '../job-status';
import { JobType } from '../job-status/jobs.enum';

export class ProgressJobDTO {
  @ApiProperty()
  fractionalProgress!: number;
}

@ApiExtraModels(ProgressJobDTO)
export class ScenarioJobStatus {
  @ApiProperty({
    enum: JobType,
  })
  kind!: JobType;

  @ApiProperty({
    example: ApiEventJobStatus.running,
    enum: ApiEventJobStatus,
  })
  status!: ApiEventJobStatus;

  @ApiPropertyOptional({
    oneOf: [{ $ref: getSchemaPath(ProgressJobDTO) }],
  })
  data?: ProgressJobDTO;

  @ApiPropertyOptional()
  isoDate?: string;
}

export class ScenarioStatus {
  @ApiProperty({
    example: `67998d2c-c35d-401e-a9a7-1229e5b2297a`,
  })
  id!: string;

  @ApiProperty({
    isArray: true,
    type: ScenarioJobStatus,
  })
  jobs!: ScenarioJobStatus[];
}

export class ProjectStatus {
  @ApiProperty({
    isArray: true,
    type: ScenarioStatus,
  })
  scenarios!: ScenarioStatus[];

  @ApiProperty({
    isArray: true,
    type: ScenarioJobStatus,
  })
  jobs!: ScenarioJobStatus[];
}

export class JSONAPIProjectJobStatusData {
  @ApiProperty({
    type: String,
  })
  type: 'project-jobs' = 'project-jobs';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: ProjectStatus;
}

export class ProjectJobsStatusDto {
  @ApiProperty()
  data!: JSONAPIProjectJobStatusData;
}
