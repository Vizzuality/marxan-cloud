import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity(`password_recovery_tokens`)
export class PasswordRecoveryToken {
  @PrimaryColumn(`uuid`, {
    name: `user_id`,
  })
  userId!: string;

  @Column({ name: `created_at` })
  createdAt!: Date;

  @Column({ name: `expired_at` })
  expiredAt!: Date;

  @Column()
  @Index()
  value!: string;
}
