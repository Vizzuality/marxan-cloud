import { ApiProperty } from '@nestjs/swagger';
import { LockStatus } from '@marxan/scenarios-planning-unit';

export class ScenarioPlanningUnitDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    enum: LockStatus,
  })
  inclusionStatus!: LockStatus;

  @ApiProperty({
    enum: LockStatus,
  })
  defaultStatus!: LockStatus;
}
