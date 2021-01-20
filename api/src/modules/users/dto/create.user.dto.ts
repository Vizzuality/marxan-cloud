import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  displayName: string | null;

  @ApiPropertyOptional()
  fname: string | null;

  @ApiPropertyOptional()
  lname: string | null;

  @ApiProperty()
  @MaxLength(18)
  password: string;
}
