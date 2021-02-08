import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { LoginDto } from './login.dto';

/**
 * @todo Allow to provide fname/lname/display name on signup (and any other
 * relevant user data), if needed. Probably We could just start with email and
 * password, and once the user has validated their email address we can let them
 * log in and set any other info.
 */
export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @ApiProperty()
  password: string;
}
