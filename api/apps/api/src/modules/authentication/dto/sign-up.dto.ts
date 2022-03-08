import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class SignUpDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  displayName?: string;

  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @ApiProperty()
  email!: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @ApiProperty()
  password!: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  fname?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  lname?: string;
}
