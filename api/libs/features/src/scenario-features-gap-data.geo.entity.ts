import { numericStringToFloat } from '@marxan/utils/numeric-string-to-float.utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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
  // explicitly set type, otherwise TypeORM (v10, at least) will cast to integer
  // TypeORM will still represent the value as string though (https://github.com/typeorm/typeorm/issues/873#issuecomment-328912050)
  @Column({ name: 'met', type: 'double precision' })
  @Transform(numericStringToFloat)
  met!: number;

  @ApiProperty()
  @Column({ name: 'coverage_target_area' })
  coverageTargetArea!: number;

  @ApiProperty()
  // explicitly set type, otherwise TypeORM (v10, at least) will cast to integer
  // TypeORM will still represent the value as string though (https://github.com/typeorm/typeorm/issues/873#issuecomment-328912050)
  @Column({ name: 'coverage_target', type: 'double precision' })
  @Transform(numericStringToFloat)
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
