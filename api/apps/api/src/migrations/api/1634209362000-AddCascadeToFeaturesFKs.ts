import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeToFeaturesFKs1634209362000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE public.features DROP CONSTRAINT features_project_id_fkey;
    ALTER TABLE public.features DROP CONSTRAINT features_created_by_fkey;
    ALTER TABLE public.features ADD CONSTRAINT features_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    ALTER TABLE public.features ADD CONSTRAINT features_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE public.features DROP CONSTRAINT features_project_id_fkey;
    ALTER TABLE public.features DROP CONSTRAINT features_created_by_fkey;
    ALTER TABLE public.features ADD CONSTRAINT features_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);
    ALTER TABLE public.features ADD CONSTRAINT features_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
    `);
  }
}
