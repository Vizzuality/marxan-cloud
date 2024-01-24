import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameClonePieceEnumForFeatureAmountsPerPlanningUnit1697812878723
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum RENAME VALUE 'project-puvspr-calculations' TO 'project-feature-amounts-per-planning-unit';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE clone_piece_enum RENAME VALUE 'project-feature-amounts-per-planning-unit' TO 'project-puvspr-calculations';`,
    );
  }
}
