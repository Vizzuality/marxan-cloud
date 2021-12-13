import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCascadeOutputs1629285535432 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE public.output_scenarios_summaries DROP CONSTRAINT if exists output_results_scenarios_id_fkey;
    ALTER TABLE public.output_scenarios_summaries ADD CONSTRAINT output_results_scenarios_id_fkey FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE public.output_scenarios_summaries DROP CONSTRAINT if exists output_results_scenarios_id_fkey;
      ALTER TABLE public.output_scenarios_summaries ADD CONSTRAINT output_results_scenarios_id_fkey FOREIGN KEY (scenario_id) REFERENCES scenarios(id);`,
    );
  }
}
