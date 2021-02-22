import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Dictionary } from 'lodash';

export class CreateOrganizationDTO {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string;

  @ApiPropertyOptional()
  metadata: Dictionary<string>;
}
