import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorFeatureImportApiEventKinds1713199859318
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds VALUES
        ('project.features.csv.import.submitted/v1/alpha'),
        ('project.features.csv.import.finished/v1/alpha'),
        ('project.features.csv.import.failed/v1/alpha'),
        ('project.features.shapefile.import.submitted/v1/alpha'),
        ('project.features.shapefile.import.finished/v1/alpha'),
        ('project.features.shapefile.import.failed/v1/alpha');

      UPDATE api_events set kind = 'project.' || kind where kind like 'features.%';

      DELETE FROM api_event_kinds WHERE id like 'features.%';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds VALUES
        ('features.csv.import.submitted/v1/alpha'),
        ('features.csv.import.finished/v1/alpha'),
        ('features.csv.import.failed/v1/alpha'),
        ('features.shapefile.import.submitted/v1/alpha'),
        ('features.shapefile.import.finished/v1/alpha'),
        ('features.shapefile.import.failed/v1/alpha');

      UPDATE api_events set kind = REPLACE(id, 'project.features.', 'features.' ) where kind like 'project.features.%';

      DELETE FROM api_event_kinds WHERE id like 'project.features.%';
    `);
  }
}
