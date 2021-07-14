import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobStatusView1623311716713 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE VIEW "scenario_job_status" AS
        SELECT
          DISTINCT ON (job_type, topic) job_type,
          api_events.topic AS scenario_id,
          projects.id AS project_id,
          api_events.kind
        FROM
          api_events
          INNER JOIN scenarios ON api_events.topic = scenarios.id
          INNER JOIN projects ON projects.id = scenarios.project_id
          CROSS JOIN LATERAL SUBSTRING(
            api_events.kind
            FROM
              'scenario.#"[^.]*#"%' FOR '#'
          ) AS job_type
        ORDER BY
          job_type,
          api_events.topic,
          api_events.timestamp DESC;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP VIEW "scenario_job_status";
      `);
  }
}
