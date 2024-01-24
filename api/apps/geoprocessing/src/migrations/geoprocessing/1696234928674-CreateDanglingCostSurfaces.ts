import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDanglingCostSurfaces1696234928674
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE dangling_cost_surfaces (
                cost_surface_id uuid PRIMARY KEY
              );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE dangling_cost_surfaces;
        `);
  }
}
