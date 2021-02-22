import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Dictionary } from 'lodash';

export class CreateProjectDTO {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string;

  @ApiProperty()
  organizationId: string;

  @ApiPropertyOptional()
  metadata: Dictionary<string>;
}
