import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Dictionary } from 'lodash';
import { User } from 'modules/users/user.api.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  /**
   * JSONB storage for non-relational attributes
   *
   * @debt We should use versioned types for metadata.
   */
  @ApiPropertyOptional()
  @Column('jsonb')
  metadata: Dictionary<string>;

  @OneToMany((_type) => Scenario, (scenario) => scenario.project)
  scenarios: Scenario[];

  @ApiProperty({
    type: () => User,
    isArray: true,
  })
  @ManyToMany((_type) => User, (user) => user.projects, { eager: true })
  users: Partial<User>[];
}

export class JSONAPIProjectData {
  @ApiProperty()
  type = 'projects';

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: Project;
}

export class ProjectResult {
  @ApiProperty()
  data: JSONAPIProjectData;
}
