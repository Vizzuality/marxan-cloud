import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeProjectIdPrimaryKeyForOutputProjectSummaries1690477596000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE output_project_summaries
        DROP COLUMN id;
    `);

    await queryRunner.query(`
      ALTER TABLE output_project_summaries
        DROP CONSTRAINT output_project_summaries_project_id_key;
      CREATE UNIQUE INDEX output_project_summaries_pkey ON output_project_summaries (project_id);
      ALTER TABLE output_project_summaries
        ADD CONSTRAINT output_project_summaries_pkey PRIMARY KEY 
        USING INDEX output_project_summaries_pkey;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE output_project_summaries
        DROP CONSTRAINT output_project_summaries_pkey;
    `);

    await queryRunner.query(`
      ALTER TABLE output_project_summaries
        ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        ADD CONSTRAINT output_project_summaries_project_id_key UNIQUE (project_id);
    `);
  }
}
