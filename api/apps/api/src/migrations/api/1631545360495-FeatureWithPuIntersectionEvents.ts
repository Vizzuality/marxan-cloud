import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeatureWithPuIntersectionEvents1631545360495
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id)
      values ('scenario.featuresWithPuIntersection.submitted/v1alpha'),
             ('scenario.featuresWithPuIntersection.failed/v1alpha'),
             ('scenario.featuresWithPuIntersection.finished/v1alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE
       FROM api_event_kinds
       WHERE id = 'scenario.featuresWithPuIntersection.submitted/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE
       FROM api_event_kinds
       WHERE id = 'scenario.featuresWithPuIntersection.failed/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE
       FROM api_event_kinds
       WHERE id = 'scenario.featuresWithPuIntersection.finished/v1alpha';`,
    );
  }
}
