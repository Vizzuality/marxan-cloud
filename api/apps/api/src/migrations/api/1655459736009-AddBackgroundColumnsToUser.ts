import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBackgroundColumnsToUser1655459736009
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE background_options AS ENUM (
            'academic_research',
            'conservation_planning'
        );
    
        CREATE TYPE level_options AS ENUM (
            'trainee',
            'student',
            'phd',
            'faculty',
            'ngo',
            'private_sector',
            'government',
            'intergovernmental'
        );

        ALTER TABLE users
            ADD COLUMN background background_options,
            ADD COLUMN level level_options;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE users
            DROP COLUMN background,
            DROP COLUMN level;
        
        DROP TYPE level_options;
        DROP TYPE background_options;
      `);
  }
}
