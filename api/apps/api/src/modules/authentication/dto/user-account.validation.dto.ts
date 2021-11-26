import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class UserAccountValidationDTO {
  /**
   * Unique activation token generated during user signup flow.
   */
  @IsUUID(4)
  @IsString()
  @ApiProperty()
  validationToken!: string;
}
