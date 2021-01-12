import { User } from 'modules/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('issued_authn_tokens')
export class IssuedAuthnToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((_type) => User, (user) => user.issuedAuthnTokens)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  userId: string;

  @Column('timestamp')
  exp: Date;

  @Column('timestamp')
  createdAt: Date;
}
