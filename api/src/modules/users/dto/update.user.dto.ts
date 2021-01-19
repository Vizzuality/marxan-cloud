import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty()
  email: string;

  @ApiProperty()
  fname: string | null;

  @ApiProperty()
  lname: string | null;

  @ApiProperty()
  @MaxLength(18)
  password: string;
}
