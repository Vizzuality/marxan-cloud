import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddDraftStatusToJobStatusEnum1618241224000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(_queryRunner: QueryRunner): Promise<void>;
}
