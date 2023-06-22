import { IsEnum, IsUUID } from 'class-validator';
import { LockStatus } from '@marxan/scenarios-planning-unit';

export class ClearLockStatusParams {
  @IsUUID()
  id!: string;

  @IsEnum(LockStatus)
  kind!: LockStatus;
}
