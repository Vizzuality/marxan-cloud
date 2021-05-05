import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProcessingState {
  Pending = 'pending',
  Succeed = 'succeed',
  Failed = 'failed',
}

export class ProcessingStatusDto {
  @ApiProperty({
    enum: ProcessingState,
  })
  status!: ProcessingState;

  @ApiPropertyOptional()
  message?: string;
}
