import { ApiProperty } from '@nestjs/swagger';

import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @ApiProperty({ example: 'aa@example.com' })
  username!: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @ApiProperty({ example: 'aauserpassword' })
  password!: string;
}
