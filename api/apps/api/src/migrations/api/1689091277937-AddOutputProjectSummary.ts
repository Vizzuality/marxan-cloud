import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOutputProjectSummary1689091277937
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE output_project_summaries (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id uuid NOT NULL UNIQUE references projects(id) ON DELETE CASCADE,
            summary_zipped_data bytea NOT NULL,
            created_at timestamp,
            last_modified_at timestamp
          );
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE output_project_summaries`);
  }
}
