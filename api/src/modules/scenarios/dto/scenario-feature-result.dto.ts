import { ApiProperty } from '@nestjs/swagger';
import { ScenarioFeatureDto } from '../../scenarios-features';

class ScenarioFeatureDataDto {
  @ApiProperty()
  type: 'features' = 'features';

  @ApiProperty()
  id!: string;

  @ApiProperty({
    isArray: true,
    type: () => ScenarioFeatureDto,
  })
  attributes!: ScenarioFeatureDto[];
}

export class ScenarioFeatureResultDto {
  @ApiProperty()
  data!: ScenarioFeatureDataDto;
}
