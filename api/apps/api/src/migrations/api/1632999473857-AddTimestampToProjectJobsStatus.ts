import { QueryRunner } from 'typeorm';

export class AddTimestampToProjectJobsStatus1632999473857 {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP VIEW "project_job_status";
      `);

    await queryRunner.query(`
    CREATE VIEW "project_job_status" as
    SELECT DISTINCT ON (job_type, topic) job_type,
                                         api_events.topic AS project_id,
                                         api_events.kind,
                                         api_events.data,
                                         api_events.timestamp
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
}
