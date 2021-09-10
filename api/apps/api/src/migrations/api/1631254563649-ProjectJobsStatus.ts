import { QueryRunner } from 'typeorm';

export class ProjectJobsStatus1631254563649 {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE VIEW "project_job_status" as
    SELECT DISTINCT ON (job_type, topic) job_type,
                                         api_events.topic AS project_id,
                                         api_events.kind,
                                         api_events.data
    FROM api_events
           CROSS JOIN LATERAL SUBSTRING(
      api_events.kind
      FROM
      'project.#"[^.]*#"%' FOR '#'
      ) AS job_type
    ORDER BY job_type,
             api_events.topic,
             api_events.timestamp DESC;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP VIEW "project_job_status";
      `);
  }
}
