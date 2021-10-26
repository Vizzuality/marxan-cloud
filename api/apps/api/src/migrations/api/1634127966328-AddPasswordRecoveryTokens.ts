import { QueryRunner } from 'typeorm';

export class AddPasswordRecoveryTokens1634127966328 {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
CREATE TABLE password_recovery_tokens (
    user_id uuid NOT NULL PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP NOT NULL,
    expired_at TIMESTAMP NOT NULL,
    value character varying NOT NULL);
CREATE INDEX password_recovery_tokens_value_idx ON password_recovery_tokens(value);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "password_recovery_tokens"`);
  }
}
