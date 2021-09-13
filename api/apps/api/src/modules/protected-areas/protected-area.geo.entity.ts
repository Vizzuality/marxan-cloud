import { ApiProperty } from '@nestjs/swagger';
import { ProtectedArea } from '@marxan/protected-areas';

export class JSONAPIProtectedAreaData {
  @ApiProperty()
  type = 'protected_areas';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: ProtectedArea;
}

export class ProtectedAreaResult {
  @ApiProperty()
  data!: JSONAPIProtectedAreaData;
}
