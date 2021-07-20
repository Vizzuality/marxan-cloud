import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
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
    example: JobStatus.running,
    enum: JobStatus,
  })
  status!: JobStatus;

  @ApiPropertyOptional({
    oneOf: [{ $ref: getSchemaPath(ProgressJobDTO) }],
  })
  data?: ProgressJobDTO;
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
