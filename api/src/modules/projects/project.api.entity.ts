import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JSONAPIData } from 'modules/countries/country.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.api.entity';

@Entity('projects')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('character varying')
  name: string;

  @ApiPropertyOptional()
  @Column('character varying')
  description: string;

  @ApiProperty({
    type: () => User,
    isArray: true,
  })
  @ManyToMany((_type) => User, (user) => user.projects, { eager: true })
  users: Partial<User>[];
}

export class ProjectResult {
  @ApiProperty()
  data: JSONAPIData<Project>;
}
