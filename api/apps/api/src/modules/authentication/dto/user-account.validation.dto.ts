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

  /**
   * Subject of the activation flow: in this case, the user's UUID.
   */
  @IsUUID(4)
  @IsString()
  @ApiProperty()
  sub!: string;
}
