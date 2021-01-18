import { ApiProperty } from '@nestjs/swagger';

export class UpdateCountryDTO {
  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;
}
