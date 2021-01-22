import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('projects')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('character varying')
  name: string;

  @ApiProperty({
    type: () => User,
    isArray: true,
  })
  @ManyToMany((_type) => User, (user) => user.projects, { eager: true })
  users: User[];
}
