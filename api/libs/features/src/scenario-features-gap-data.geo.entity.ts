import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, ViewEntity } from 'typeorm';
import { FeatureTag } from './domain';

@ViewEntity('scenario_features_gap_data', {
  expression: `
  with gap_data as (
    select
      fd.feature_id,
      scenario_id,
      sum(total_area) total_area,
      sum(current_pa) met_area,
      min(prop) as coverage_target
    from scenario_features_data sfd 
    inner join features_data fd on sfd.feature_class_id=fd.id 
    group by fd.feature_id, feature_class_id, scenario_id)
  select
    scenario_id,
    feature_id,
    total_area,
    met_area,
    case 
      when total_area > 0 then round((met_area/total_area)*100)
      else 0
    end as met,
    total_area * coverage_target as coverage_target_area,
    coverage_target,
    met_area >= (total_area * coverage_target) as on_target
  from gap_data;`
})
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

  @ApiProperty({
    enum: FeatureTag,
  })
  tag!: FeatureTag;

  @ApiPropertyOptional({
    description: `Name of the feature, for example \`Lion in Deserts\`.`,
  })
  name?: string | null;

  @ApiPropertyOptional({
    description: `Description of the feature.`,
  })
  description?: string | null;
}
