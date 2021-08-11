import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProcessingEvents1627979898681 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('scenario.geofeatureCopy.submitted/v1alpha'),
      ('scenario.geofeatureCopy.failed/v1alpha'),
      ('scenario.geofeatureCopy.finished/v1alpha'),
      ('scenario.geofeatureSplit.submitted/v1alpha'),
      ('scenario.geofeatureSplit.failed/v1alpha'),
      ('scenario.geofeatureSplit.finished/v1alpha'),
      ('scenario.geofeatureStratification.submitted/v1alpha'),
      ('scenario.geofeatureStratification.failed/v1alpha'),
      ('scenario.geofeatureStratification.finished/v1alpha');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.geofeatureCopy.submitted/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.geofeatureCopy.failed/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.geofeatureCopy.finished/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.geofeatureSplit.submitted/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.geofeatureSplit.failed/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.geofeatureSplit.finished/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.geofeatureStratification.submitted/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.geofeatureStratification.failed/v1alpha';`,
    );
    await queryRunner.query(
      `DELETE FROM api_event_kinds WHERE id = 'scenario.geofeatureStratification.finished/v1alpha';`,
    );
  }
}
