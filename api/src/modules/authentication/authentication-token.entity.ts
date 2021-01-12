import { User } from 'modules/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('authentication_tokens')
export class AuthenticationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((_type) => User, (user) => user.authenticationTokens)
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
