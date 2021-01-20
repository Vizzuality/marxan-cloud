import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Dictionary } from 'lodash';
import { ScenarioType } from '../scenario.entity';

export class CreateScenarioDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string;

  @ApiPropertyOptional()
  type: ScenarioType;

  @ApiPropertyOptional()
  metadata: Dictionary<string>;
}
