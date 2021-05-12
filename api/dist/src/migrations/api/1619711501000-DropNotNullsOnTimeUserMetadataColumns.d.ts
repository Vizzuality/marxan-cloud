import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class DropNotNullsOnTimeUserMetadataColumns1619711501000 implements MigrationInterface {
    private tablesToAlter;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
