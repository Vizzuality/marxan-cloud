import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '../scenario.api.entity';

export class ProcessingStatusDto {
  @ApiProperty({
    enum: JobStatus,
  })
  status!: JobStatus;

  @ApiPropertyOptional()
  message?: string;
}
