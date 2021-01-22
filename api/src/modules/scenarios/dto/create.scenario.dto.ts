import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Dictionary } from 'lodash';
import { ScenarioType } from '../scenario.entity';

export class CreateScenarioDTO {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string;

  @ApiProperty()
  type: ScenarioType;

  @ApiProperty()
  projectId: string;

  @ApiPropertyOptional()
  metadata: Dictionary<string>;
}
