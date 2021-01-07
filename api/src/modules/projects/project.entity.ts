import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('character varying')
  name: string;

  @ManyToMany((_type) => User, (user) => user.projects, { eager: true })
  users: User[];
}
