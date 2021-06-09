import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { JobType } from '../job-status/jobs.enum';

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
}

export class ScenarioStatus {
  @ApiProperty({
    example: `67998d2c-c35d-401e-a9a7-1229e5b2297a`,
  })
  id!: string;

  @ApiProperty({
    description: `Computed value across each job. Will either result in \`${JobStatus.running}\` or \`${JobStatus.done}\` or \`${JobStatus.failure}\``,
    example: JobStatus.running,
    enum: JobStatus,
  })
  status!: JobStatus;

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
  type = 'project-jobs';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: ProjectStatus;
}

export class ProjectJobsStatusDto {
  @ApiProperty()
  data!: JSONAPIProjectJobStatusData;
}
