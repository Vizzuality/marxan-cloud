import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('character varying')
  email: string;

  @Column('character varying')
  fname: string | null;

  @Column('character varying')
  lname: string | null;
}
