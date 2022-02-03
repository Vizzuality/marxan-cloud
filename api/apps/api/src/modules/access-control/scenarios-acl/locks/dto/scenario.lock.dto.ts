import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsUUID } from 'class-validator';

export class ScenarioLockDto {
  @IsUUID()
  @ApiProperty()
  userId!: string;

  @IsUUID()
  @ApiProperty()
  scenarioId!: string;

  @IsDate()
  @ApiPropertyOptional()
  createdAt?: Date;
}

export class ScenarioLockResult {
  @ApiProperty()
  data!: ScenarioLockDto;
}
