import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum Backgrounds {
  academic_research_science = 'academic_research',
  conservation_planning = 'conservation_planning',
}

export enum Levels {
  trainee = 'trainee',
  student = 'student',
  phd = 'phd',
  faculty = 'faculty',
  ngo = 'ngo',
  private_sector = 'private_sector',
  government = 'government',
  intergovernmental = 'intergovernmental',
}

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

  @IsOptional()
  @IsEnum(Backgrounds)
  @ApiPropertyOptional()
  background?: Backgrounds;

  @IsOptional()
  @IsEnum(Levels)
  @ApiPropertyOptional()
  level?: Levels;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  country?: string;
}
