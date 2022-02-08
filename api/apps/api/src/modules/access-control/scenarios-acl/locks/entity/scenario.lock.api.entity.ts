import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { User } from '@marxan-api/modules/users/user.api.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity(`scenario_locks`)
export class ScenarioLockEntity {
  @PrimaryColumn({
    type: `uuid`,
    name: `user_id`,
  })
  userId!: string;

  @PrimaryColumn({
    type: `uuid`,
    name: `scenario_id`,
  })
  scenarioId!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: 'now()',
  })
  createdAt!: Date;

  @OneToOne(() => Scenario, {
    onDelete: 'CASCADE',
    primary: true,
  })
  @JoinColumn({
    name: `scenario_id`,
    referencedColumnName: `id`,
  })
  scenario?: Scenario;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    primary: true,
  })
  @JoinColumn({
    name: `user_id`,
    referencedColumnName: `id`,
  })
  user?: User;
}
