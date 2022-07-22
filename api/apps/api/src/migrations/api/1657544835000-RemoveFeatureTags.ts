import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveFeatureTags1657544835000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE features
        DROP COLUMN tag;
    `);
  
    await queryRunner.query(`  
      DROP TYPE features_tags;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "features_tags" AS ENUM (
        'bioregional',
        'species'
      );
    `);

    /**
     * As we cannot know whether existing features are of bioregional or
     * species kind, we set them all as "bioregional" arbitrarily. This should
     * not really apply in practice, of course.
     */
    await queryRunner.query(`
      ALTER TABLE features
        ADD COLUMN tag features_tags;
      
      UPDATE features
        SET tag = 'bioregional';
      
      ALTER TABLE features
        ALTER COLUMN tag SET NOT NULL;
    `);
  }
}
