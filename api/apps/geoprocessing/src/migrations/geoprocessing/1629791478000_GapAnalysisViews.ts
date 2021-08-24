import { MigrationInterface, QueryRunner } from 'typeorm';

export class GapAnalysisViews1629791478000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
create view scenario_features_gap_data as
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
    feature_id,
    scenario_id,
    total_area,
    met_area,
    case 
      when total_area > 0 then round((met_area/total_area)*100)
      else 0
    end as met,
    total_area * coverage_target as coverage_target_area,
    coverage_target,
    met_area >= (total_area * coverage_target) as on_target
  from gap_data;
    `);

    await queryRunner.query(`
create view scenario_features_output_gap_data as
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
    run_id,
    feature_id
  from gap_data
  group by run_id, feature_id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
drop view scenario_features_output_gap_data;
    `);

    await queryRunner.query(`
drop view scenario_feature_gap_data;
    `);
  }
}
