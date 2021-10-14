import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsPassword } from './is-password.decorator';

export class UpdateUserPasswordDTO {
  @ApiProperty()
  @IsString()
  currentPassword!: string;

  @ApiProperty()
  @IsPassword()
  newPassword!: string;
}
