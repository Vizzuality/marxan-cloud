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

export class ScenarioLockResultSingular {
  @ApiProperty()
  data!: ScenarioLockDto | null;
}
export class ScenarioLockResultPlural {
  @ApiProperty()
  data!: ScenarioLockDto[];
}
