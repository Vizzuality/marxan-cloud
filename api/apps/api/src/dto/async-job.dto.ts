import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Exclude, plainToClass } from 'class-transformer';
import { AsyncJobType } from './async-job-type';

export class AsyncJobDto {
  @ApiProperty({
    enum: AsyncJobType,
  })
  type!: AsyncJobType;

  @ApiPropertyOptional({
    isArray: true,
    type: String,
  })
  ids?: string[];

  @ApiProperty()
  started!: boolean;

  @ApiProperty()
  isoDate!: string;

  static forScenario(): AsyncJobDto {
    return plainToClass(AsyncJobDto, {
      type: AsyncJobType.Scenario,
      isoDate: new Date().toISOString(),
      started: true,
    });
  }

  static forProject(ids?: string[]): AsyncJobDto {
    return plainToClass(AsyncJobDto, {
      type: AsyncJobType.Project,
      started: true,
      isoDate: new Date().toISOString(),
      ids,
    });
  }

  asJsonApiMetadata(): JsonApiAsyncJobMeta {
    return plainToClass(JsonApiAsyncJobMeta, {
      meta: plainToClass(AsyncJobDto, {
        started: this.started,
        ids: this.ids,
        isoDate: this.isoDate,
        type: this.type,
      }),
    });
  }
}

export class JsonApiAsyncJobMeta {
  @ApiProperty({
    type: AsyncJobDto,
  })
  meta!: AsyncJobDto;
}
