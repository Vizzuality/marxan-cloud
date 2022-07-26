import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, ViewEntity } from 'typeorm';

@ViewEntity('scenario_features_gap_data')
export class ScenarioFeaturesGapData {
  @ApiProperty()
  @Column({ name: 'scenario_id' })
  scenarioId!: string;

  @ApiProperty()
  @Column({ name: 'feature_id' })
  featureId!: string;

  @ApiProperty()
  @Column({ name: 'total_area' })
  totalArea!: number;

  @ApiProperty()
  @Column({ name: 'met_area' })
  metArea!: number;

  @ApiProperty()
  @Column({ name: 'met' })
  met!: number;

  @ApiProperty()
  @Column({ name: 'coverage_target_area' })
  coverageTargetArea!: number;

  @ApiProperty()
  @Column({ name: 'coverage_target' })
  coverageTarget!: number;

  @ApiProperty()
  @Column({ name: 'on_target' })
  onTarget!: boolean;

  // Properties added via extend
  @ApiPropertyOptional()
  featureClassName?: string | null;

  @ApiPropertyOptional({
    description: `Name of the feature, for example \`Lion in Deserts\`.`,
  })
  name?: string | null;

  @ApiPropertyOptional({
    description: `Description of the feature.`,
  })
  description?: string | null;
}
