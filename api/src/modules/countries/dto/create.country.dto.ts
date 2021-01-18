import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}
