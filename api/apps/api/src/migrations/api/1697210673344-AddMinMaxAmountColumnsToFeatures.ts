import { MigrationInterface, QueryRunner } from "typeorm"

export class AddMinMaxAmountColumnsToFeatures1697210673344 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE features
            ADD COLUMN amount_min float8,
            ADD COLUMN amount_max float8;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE features
            DROP COLUMN amount_min float8,
            DROP COLUMN amount_max float8;
    `);
    }

}
