import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Dictionary } from 'lodash';
import { Project } from 'modules/projects/project.api.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'modules/users/user.api.entity';

/**
 * The kind of Marxan scenario (standard, Marxan with Zones, and possibly other
 * kinds in the future).
 */
export enum ScenarioType {
  standard = 'Standard',
  marxanWithZones = 'Marxan with zones',
}

@Entity('scenarios')
export class Scenario {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('character varying')
  name: string;

  @ApiPropertyOptional()
  @Column('character varying')
  description: string;

  @ApiProperty({ enum: ScenarioType, enumName: 'ScenarioType' })
  @Column('enum')
  type: ScenarioType;

  /**
   * The project to which this scenario belongs.
   */
  @ManyToOne((_type) => Project, (project) => project.scenarios)
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
  })
  project: Project;

  /**
   * JSONB storage for non-relational attributes
   *
   * @debt We should use versioned types for metadata.
   */
  @ApiPropertyOptional()
  @Column('jsonb')
  metadata: Dictionary<string>;

  @ApiProperty({
    type: () => User,
    isArray: true,
  })
  @ManyToMany((_type) => User, (user) => user.scenarios, { eager: true })
  users: Partial<User>[];
}

export class JSONAPIScenarioData {
  @ApiProperty()
  type = 'scenarios';

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: Scenario;
}

export class ScenarioResult {
  @ApiProperty()
  data: JSONAPIScenarioData;
}
