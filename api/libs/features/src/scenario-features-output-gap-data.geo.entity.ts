import { ApiProperty } from '@nestjs/swagger';
import { Column, ViewEntity } from 'typeorm';

@ViewEntity('scenario_features_output_gap_data', {
  expression: `
  with gap_data as (
    select
      amount,
      occurrences,
      run_id,
      fd.feature_id,
      sfd.scenario_id,
      sfd.total_area,
      sfd.prop as coverage_target
    from output_scenarios_features_data osfd
    inner join scenario_features_data sfd on osfd.feature_scenario_id=sfd.id
    inner join features_data fd on sfd.feature_class_id=fd.id)
  select
    scenario_id,
    feature_id,
    sum(amount) as met_area,
    case
      when sum(total_area) <> 0 and sum(total_area) is not null then
        round((sum(amount)/sum(total_area))*100)
      else
        0
    end as met,
    sum(occurrences) as met_occurrences,
    sum(total_area) * min(coverage_target) as coverage_target_area,
    min(coverage_target) as coverage_target,
    sum(amount) >= (sum(total_area) * min(coverage_target)) as on_target,
    run_id
  from gap_data
  group by run_id, feature_id, scenario_id;`
})
export class ScenarioFeaturesOutputGapData {
  @ApiProperty()
  @Column('scenario_id')
  scenarioId!: string;

  @ApiProperty()
  @Column('feature_id')
  featureId!: string;

  @ApiProperty()
  @Column('met_area')
  metArea!: number;

  @ApiProperty()
  @Column('met')
  met!: number;

  @ApiProperty()
  @Column('met_occurrences')
  metOccurrences!: number;

  @ApiProperty()
  @Column('coverage_target_area')
  coverageTargetArea!: number;

  @ApiProperty()
  @Column('coverage_target')
  coverageTarget!: number;

  @ApiProperty()
  @Column('on_target')
  onTarget!: boolean;

  @ApiProperty()
  @Column('run_id')
  runId!: number;
}
