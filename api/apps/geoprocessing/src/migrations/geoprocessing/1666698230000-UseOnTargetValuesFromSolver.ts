import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseOnTargetValuesFromSolver1666698230000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
drop view scenario_features_output_gap_data;

create view scenario_features_output_gap_data as
  with gap_data as (
    select
      amount,
      occurrences,
      run_id,
      sfd.api_feature_id as feature_id,
      sfd.scenario_id,
      osfd.total_area,
      sfd.prop as coverage_target,
      osfd.target as target_met
    from output_scenarios_features_data osfd
    inner join scenario_features_data sfd on osfd.scenario_features_id=sfd.id)
  select
    scenario_id,
    feature_id,
    sum(total_area) as total_area,
    sum(amount) as met_area,
    case
      when sum(total_area) <> 0 and sum(total_area) is not null then
        round((sum(amount)/sum(total_area))*100)
      else
        0
    end as met,
    sum(occurrences) as met_occurrences,
    sum(total_area) * min(coverage_target) as coverage_target_area,
    round(min(coverage_target) * 100) as coverage_target,
    bool_and(target_met) as on_target,
    run_id
  from gap_data
  group by run_id, feature_id, scenario_id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    drop view scenario_features_output_gap_data;

    create view scenario_features_output_gap_data as
      with gap_data as (
        select
          amount,
          occurrences,
          run_id,
          sfd.api_feature_id as feature_id,
          sfd.scenario_id,
          osfd.total_area,
          sfd.prop as coverage_target
        from output_scenarios_features_data osfd
        inner join scenario_features_data sfd on osfd.feature_scenario_id=sfd.id)
      select
        scenario_id,
        feature_id,
        sum(total_area) as total_area,
        sum(amount) as met_area,
        case
          when sum(total_area) <> 0 and sum(total_area) is not null then
            round((sum(amount)/sum(total_area))*100)
          else
            0
        end as met,
        sum(occurrences) as met_occurrences,
        sum(total_area) * min(coverage_target) as coverage_target_area,
        round(min(coverage_target) * 100) as coverage_target,
        sum(amount) >= (sum(total_area) * min(coverage_target)) as on_target,
        run_id
      from gap_data
      group by run_id, feature_id, scenario_id;
    `);
  }
}
