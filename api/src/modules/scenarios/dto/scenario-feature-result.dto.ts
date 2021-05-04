import { ApiProperty } from '@nestjs/swagger';
import { ScenariosFeaturesView } from '../../scenarios-features';

class ScenarioFeatureDataDto {
  @ApiProperty()
  type: 'features' = 'features';

  @ApiProperty()
  id!: string;

  @ApiProperty({
    isArray: true,
    type: () => ScenariosFeaturesView,
  })
  attributes!: ScenariosFeaturesView[];
}

export class ScenarioFeatureResultDto {
  @ApiProperty()
  data!: ScenarioFeatureDataDto;
}
