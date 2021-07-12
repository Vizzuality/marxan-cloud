import { MigrationInterface, QueryRunner } from 'typeorm';

export class marxanOutputEntities1624890503611 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Rename output summary table to be more verbose - maps output_sum
      -- Also connectivity_in, edge, out and fraction should be under metadata
      ALTER TABLE output_results
        RENAME TO output_scenarios_summaries;

      ALTER TABLE output_scenarios_summaries
        RENAME COLUMN scenarios_id TO scenario_id;

      ALTER TABLE output_scenarios_summaries
        ADD COLUMN best bool,
        ADD COLUMN distinct_five bool;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Rename output summary table to is past
      ALTER TABLE output_scenarios_summaries
        RENAME TO output_results;
        ALTER TABLE output_results
        RENAME COLUMN scenario_id TO scenarios_id,
        DROP COLUMN best,
        DROP COLUMN distinct_five;
      `);
  }
}
