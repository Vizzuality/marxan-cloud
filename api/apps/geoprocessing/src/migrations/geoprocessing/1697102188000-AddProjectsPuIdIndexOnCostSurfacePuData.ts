import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectsPuIdIndexOnCostSurfacePuData1697102188000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
create index cost_surface_pu_data_projects_pu_id on cost_surface_pu_data (projects_pu_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
drop index cost_surface_pu_data_projects_pu_id;
        );
   `);
  }
}
